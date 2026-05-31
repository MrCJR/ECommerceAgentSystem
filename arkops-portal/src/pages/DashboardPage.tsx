import {
  AlertOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  LineChartOutlined,
  RobotOutlined,
  ShopOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

const statusColors: Record<string, string> = {
  succeeded: '#16a34a',
  waiting_approval: '#ea580c',
  running: '#2563eb',
  failed: '#dc2626'
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function DashboardPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.getSummary });
  const trendMax = Math.max(...(data?.operationTrend.map((item) => item.runs) ?? [1]));
  const statusTotal = data?.taskStatusBreakdown.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const donutSegments = data?.taskStatusBreakdown ?? [];
  let donutCursor = 0;
  const donutGradient = donutSegments.length
    ? donutSegments
        .map((item) => {
          const start = donutCursor;
          const end = start + (statusTotal ? (item.count / statusTotal) * 100 : 0);
          donutCursor = end;
          return `${statusColors[item.status] ?? '#94a3b8'} ${start}% ${end}%`;
        })
        .join(', ')
    : '#e2e8f0 0% 100%';
  const statusTone: Record<string, 'success' | 'warning' | 'error'> = {
    healthy: 'success',
    warning: 'warning',
    blocked: 'error'
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <div className="metric-grid">
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon-blue"><ShopOutlined /></span>
            <Typography.Text type="secondary">{t('dashboard.storeMetricMeta')}</Typography.Text>
          </div>
          <Statistic title={t('dashboard.connectedStores')} value={data?.connectedStores ?? 0} />
          <div className="mini-spark">
            {[36, 44, 52, 58, 64, 72, 80].map((height) => <span key={height} style={{ height }} />)}
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon-teal"><RobotOutlined /></span>
            <Typography.Text type="secondary">{t('dashboard.taskMetricMeta')}</Typography.Text>
          </div>
          <Statistic title={t('dashboard.runningTasks')} value={data?.runningTasks ?? 0} />
          <div className="mini-spark mini-spark-teal">
            {[42, 64, 50, 72, 58, 82, 68].map((height) => <span key={height} style={{ height }} />)}
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon-orange"><CheckSquareOutlined /></span>
            <Typography.Text type="secondary">{t('dashboard.approvalMetricMeta')}</Typography.Text>
          </div>
          <Statistic title={t('dashboard.pendingApprovals')} value={data?.pendingApprovals ?? 0} />
          <div className="mini-spark mini-spark-orange">
            {[28, 36, 48, 44, 60, 56, 40].map((height) => <span key={height} style={{ height }} />)}
          </div>
        </Card>
        <Card className="metric-card">
          <div className="metric-card-top">
            <span className="metric-icon metric-icon-red"><AlertOutlined /></span>
            <Typography.Text type="secondary">{t('dashboard.loginMetricMeta')}</Typography.Text>
          </div>
          <Statistic title={t('dashboard.loginRequired')} value={data?.loginRequiredStores ?? 0} />
          <div className="mini-spark mini-spark-red">
            {[22, 26, 30, 24, 28, 36, 32].map((height) => <span key={height} style={{ height }} />)}
          </div>
        </Card>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                {t('dashboard.trendTitle')}
              </Space>
            }
            extra={<Typography.Text type="secondary">{t('dashboard.trendDescription')}</Typography.Text>}
          >
            <div className="trend-chart" aria-label={t('dashboard.trendTitle')}>
              {data?.operationTrend.map((point) => (
                <div className="trend-column" key={point.dayKey}>
                  <div className="trend-bars">
                    <span
                      className="trend-bar trend-bar-runs"
                      style={{ height: `${Math.max(12, (point.runs / trendMax) * 150)}px` }}
                      title={`${t('dashboard.runs')}: ${point.runs}`}
                    />
                    <span
                      className="trend-bar trend-bar-approvals"
                      style={{ height: `${Math.max(8, (point.approvals / trendMax) * 150)}px` }}
                      title={`${t('dashboard.approvalShort')}: ${point.approvals}`}
                    />
                    <span
                      className="trend-bar trend-bar-failures"
                      style={{ height: `${Math.max(6, (point.failures / trendMax) * 150)}px` }}
                      title={`${t('dashboard.failures')}: ${point.failures}`}
                    />
                  </div>
                  <Typography.Text type="secondary">{t(point.dayKey)}</Typography.Text>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><i className="legend-dot legend-runs" />{t('dashboard.runs')}</span>
              <span><i className="legend-dot legend-approvals" />{t('dashboard.approvalShort')}</span>
              <span><i className="legend-dot legend-failures" />{t('dashboard.failures')}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            title={
              <Space>
                <DashboardOutlined />
                {t('dashboard.taskStatusTitle')}
              </Space>
            }
          >
            <div className="status-visual">
              <div className="donut-chart" style={{ background: `conic-gradient(${donutGradient})` }}>
                <div>
                  <strong>{statusTotal}</strong>
                  <span>{t('entity.task')}</span>
                </div>
              </div>
              <div className="status-list">
                {data?.taskStatusBreakdown.map((item) => (
                  <div className="status-row" key={item.status}>
                    <span className="status-label">
                      <i style={{ background: statusColors[item.status] }} />
                      {t(`status.${item.status}`)}
                    </span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.quotaTitle')}>
            <div className="quota-list">
              {data?.quotaUsage.map((item) => {
                const percent = Math.round((item.used / item.limit) * 100);
                return (
                  <div className="quota-row" key={item.key}>
                    <div>
                      <Typography.Text strong>{t(item.key)}</Typography.Text>
                      <Typography.Text type="secondary">
                        {formatNumber(item.used)} / {formatNumber(item.limit)}
                      </Typography.Text>
                    </div>
                    <Progress percent={percent} strokeColor={item.color} size="small" />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.agentMixTitle')}>
            <div className="agent-mix-list">
              {data?.agentMix.map((item) => {
                const maxCount = Math.max(...(data?.agentMix.map((agent) => agent.count) ?? [1]));
                return (
                  <div className="agent-mix-row" key={item.agentType}>
                    <span>{t(`agent.${item.agentType}`)}</span>
                    <div>
                      <span style={{ width: `${(item.count / maxCount) * 100}%`, background: item.color }} />
                    </div>
                    <strong>{item.count}</strong>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.healthTitle')}>
            <div className="health-list">
              {data?.healthSignals.map((item) => (
                <div className="health-row" key={item.key}>
                  <span className={`health-dot health-dot-${item.status}`} />
                  <div>
                    <Typography.Text strong>{item.value}</Typography.Text>
                    <Typography.Text type="secondary">{t(item.key)}</Typography.Text>
                  </div>
                  <Tag color={statusTone[item.status]}>{t(`dashboard.${item.status}`)}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined />
                {t('dashboard.recentTasks')}
              </Space>
            }
          >
            <List
              dataSource={data?.recentTasks}
              renderItem={(task) => (
                <List.Item actions={[<Link to={`/tasks/${task.id}`}>{t('common.view')}</Link>]}>
                  <List.Item.Meta title={task.title} description={task.goal} />
                  <StatusBadge value={task.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title={t('dashboard.approvalQueue')}>
            <List
              dataSource={data?.recentApprovals}
              renderItem={(approval) => (
                <List.Item actions={[<Link to={`/approvals/${approval.id}`}>{t('common.review')}</Link>]}>
                  <List.Item.Meta
                    title={approval.title}
                    description={<Typography.Text type="secondary">{approval.reason}</Typography.Text>}
                  />
                  <StatusBadge value={approval.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
