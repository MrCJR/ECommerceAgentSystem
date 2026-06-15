import {
  CrownOutlined,
  DownloadOutlined,
  FileTextOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Col, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { financeApi } from '../api/finance';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import type { BillingRecord } from '../types/domain';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

// ===== 顶部概览卡片 =====

function FinanceSummary() {
  const { t } = useI18n();
  const { data: usage } = useQuery({ queryKey: ['usageOverview'], queryFn: financeApi.getUsageOverview });
  const { data: analysis } = useQuery({ queryKey: ['costAnalysis'], queryFn: financeApi.getCostAnalysis });
  const { data: currentBill } = useQuery({ queryKey: ['currentBill'], queryFn: financeApi.getCurrentBillDetail });
  const { data: currentPlan } = useQuery({ queryKey: ['currentPlan'], queryFn: financeApi.getCurrentPlan });
  const { data: records } = useQuery({ queryKey: ['billingRecords'], queryFn: financeApi.getBillingRecords });
  const pendingRecord = records?.find((r) => r.status === 'pending');

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} lg={4}>
        <Card style={{ height: '100%' }}>
          <Typography.Text type="secondary">{t('finance.currentPlanLabel')}</Typography.Text>
          <br />
          <Typography.Text strong style={{ fontSize: 18, color: '#2563eb' }}>{currentPlan?.tier ?? '-'}</Typography.Text>
          <br />
          <Link to="/subscription" style={{ fontSize: 12 }}>
            <CrownOutlined style={{ marginRight: 4 }} />{t('finance.manageSubscription')}
          </Link>
        </Card>
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <Card>
          <Statistic
            title={t('finance.monthlyFee')}
            value={currentBill?.total ?? 0}
            prefix="$"
            precision={2}
            valueStyle={{ color: '#2563eb', fontWeight: 'bold', fontSize: 22 }}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{t('finance.baseFee')} ${currentBill?.baseSubscription ?? 0}</Typography.Text>
        </Card>
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <Card>
          <Statistic
            title={t('finance.usagePercent')}
            value={usage ? Math.round((usage.agentCalls.used / usage.agentCalls.limit) * 100) : 0}
            suffix="%"
            valueStyle={{ color: usage && usage.agentCalls.used > usage.agentCalls.limit ? '#dc2626' : '#16a34a', fontWeight: 'bold', fontSize: 22 }}
          />
          <Progress
            percent={usage ? Math.min(Math.round((usage.agentCalls.used / usage.agentCalls.limit) * 100), 100) : 0}
            size="small"
            strokeColor={usage && usage.agentCalls.used > usage.agentCalls.limit ? '#dc2626' : '#2563eb'}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <Card>
          <Statistic
            title={t('finance.savedAmount')}
            value={analysis?.estimatedSaving.savedAmount ?? 0}
            prefix="$"
            valueStyle={{ color: '#16a34a', fontWeight: 'bold', fontSize: 22 }}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{t('finance.savedShort')}</Typography.Text>
        </Card>
      </Col>
      <Col xs={12} sm={6} lg={4}>
        <Card>
          <Statistic
            title={t('finance.nextDueDate')}
            value={pendingRecord?.dueDate ?? '-'}
            valueStyle={{ color: '#ea580c', fontWeight: 'bold', fontSize: 22 }}
          />
          <Tag color={pendingRecord ? 'orange' : 'default'}>{pendingRecord ? t('finance.status_pending') : t('finance.noPending')}</Tag>
        </Card>
      </Col>
    </Row>
  );
}

// ===== 用量 =====

function UsageSection() {
  const { t } = useI18n();
  const { data: trend = [] } = useQuery({ queryKey: ['usageTrend'], queryFn: financeApi.getUsageTrend });
  if (trend.length === 0) return null;

  const metrics = [
    { key: 'agentCalls' as const, label: t('finance.agentCalls'), color: '#2563eb' },
    { key: 'tokenUsage' as const, label: t('finance.tokenUsage'), color: '#7c3aed' },
    { key: 'browserSessions' as const, label: t('finance.browserSessions'), color: '#0f766e' },
    { key: 'stores' as const, label: t('finance.stores'), color: '#ea580c' }
  ];

  const maxValues: Record<string, number> = {};
  for (const m of metrics) {
    maxValues[m.key] = Math.max(...trend.map((d) => d[m.key] ?? 0), 1);
  }

  return (
    <Card
      title={<><LineChartOutlined /> {t('finance.usageTrend')}</>}
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]}>
        {metrics.map((m) => (
          <Col xs={24} lg={12} key={m.key}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>{m.label}</Typography.Text>
            <div className="trend-chart usage-chart" style={{ minHeight: 120 }}>
              {trend.map((d) => (
                <div className="trend-column" key={d.month}>
                  <div className="trend-bars" style={{ height: 100 }}>
                    <span
                      className="trend-bar"
                      style={{
                        height: `${Math.max(10, (d[m.key] ?? 0) / maxValues[m.key] * 90)}px`,
                        width: 18,
                        background: m.color
                      }}
                      title={`${m.label}: ${d[m.key]}${m.key === 'tokenUsage' ? 'K' : ''}`}
                    />
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{d.month}</Typography.Text>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t('finance.monthAvg')}: {Math.round(trend.reduce((sum, d) => sum + (d[m.key] ?? 0), 0) / trend.length).toLocaleString()}{m.key === 'tokenUsage' ? 'K' : ' 次'}
              </Typography.Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

// ===== 账单 =====

function BillingSection() {
  const { t } = useI18n();
  const { data: records } = useQuery({ queryKey: ['billingRecords'], queryFn: financeApi.getBillingRecords });
  const { data: currentBill } = useQuery({ queryKey: ['currentBill'], queryFn: financeApi.getCurrentBillDetail });
  const statusColors: Record<BillingRecord['status'], string> = { pending: 'orange', paid: 'green', overdue: 'red' };
  const columns: ColumnsType<BillingRecord> = [
    { title: t('finance.period'), dataIndex: 'period' },
    { title: t('finance.amount'), dataIndex: 'amount', render: (v: number) => formatCurrency(v), align: 'right' },
    { title: t('finance.status'), dataIndex: 'status', render: (s: BillingRecord['status']) => <Tag color={statusColors[s]}>{t(`finance.status_${s}`)}</Tag>, width: 100 },
    { title: t('finance.dueDate'), dataIndex: 'dueDate', width: 110 },
    { title: t('finance.invoice'), dataIndex: 'invoiceUrl', render: (url: string | undefined) => url ? <Button size="small" icon={<DownloadOutlined />}>{t('finance.download')}</Button> : '-', width: 100 }
  ];

  return (
    <Card
      title={<><FileTextOutlined /> {t('finance.billing')}</>}
      style={{ marginBottom: 24 }}
    >
      {currentBill && (
        <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}><Statistic title={t('finance.baseFee')} value={currentBill.baseSubscription} prefix="$" valueStyle={{ fontSize: 16 }} /></Col>
          {currentBill.overageItems.map((item, idx) => (
            <Col xs={12} sm={6} key={idx}>
              <Statistic title={item.description} value={item.amount} prefix="$" precision={2} valueStyle={{ fontSize: 16, color: '#ea580c' }} />
            </Col>
          ))}
          <Col xs={12} sm={6}><Statistic title={t('finance.total')} value={currentBill.total} prefix="$" valueStyle={{ fontSize: 20, color: '#2563eb', fontWeight: 'bold' }} /></Col>
        </Row>
      )}
      <Table rowKey="id" columns={columns} dataSource={records} pagination={false} size="small" />
    </Card>
  );
}

// ===== 主页面 =====

export function BillingSettingsPage() {
  const { t } = useI18n();
  return (
    <div className="page-stack">
      <PageHeader title={t('finance.title')} description={t('finance.description')} />
      <FinanceSummary />
      <UsageSection />
      <BillingSection />
    </div>
  );
}
