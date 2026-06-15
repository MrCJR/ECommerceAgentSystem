import {
  AlertOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  DollarOutlined,
  FireOutlined,
  LineChartOutlined,
  RobotOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Progress, Row, Space, Statistic, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { businessDashboardApi } from '../api/businessDashboard';
import { dashboardApi } from '../api/dashboard';
import { useI18n } from '../app/i18n';
import { DashboardLiveFeed } from '../components/DashboardLiveFeed';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

const statusColors: Record<string, string> = {
  succeeded: '#16a34a',
  waiting_approval: '#ea580c',
  running: '#2563eb',
  failed: '#dc2626'
};

function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function changePercent(current: number, previous: number) {
  if (previous === 0) return { value: 0, up: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: pct, up: pct >= 0 };
}

// ===== 经营概览（老板视角） =====

function BusinessOverview() {
  const { t } = useI18n();
  const { data: biz } = useQuery({ queryKey: ['businessDashboard'], queryFn: businessDashboardApi.getMetrics });

  return (
    <>
      {/* GMV & 核心经营指标 */}
      {biz && (
        <>
          <Typography.Title level={5} style={{ marginBottom: 12 }}>
            <DollarOutlined style={{ marginRight: 8 }} />{t('biz.title')}
          </Typography.Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title={t('biz.todayGmv')}
                  value={biz.gmv.today}
                  prefix="$"
                  precision={0}
                  valueStyle={{ color: '#2563eb' }}
                  suffix={
                    <span style={{ fontSize: 14 }}>
                      {changePercent(biz.gmv.today, biz.gmv.yesterday).up
                        ? <span style={{ color: '#16a34a' }}><ArrowUpOutlined /> {changePercent(biz.gmv.today, biz.gmv.yesterday).value}%</span>
                        : <span style={{ color: '#dc2626' }}><ArrowDownOutlined /> {Math.abs(changePercent(biz.gmv.today, biz.gmv.yesterday).value)}%</span>}
                      <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>{t('biz.vsYesterday')}</Typography.Text>
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title={t('biz.todayOrders')}
                  value={biz.orders.today}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#0f766e' }}
                  suffix={
                    <span style={{ fontSize: 14 }}>
                      {changePercent(biz.orders.today, biz.orders.yesterday).up
                        ? <span style={{ color: '#16a34a' }}>+{changePercent(biz.orders.today, biz.orders.yesterday).value}%</span>
                        : <span style={{ color: '#dc2626' }}>{changePercent(biz.orders.today, biz.orders.yesterday).value}%</span>}
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title={t('biz.aov')}
                  value={biz.aov}
                  prefix="$"
                  precision={1}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title={t('biz.storeCount')}
                  value={`${biz.storeCount.online}/${biz.storeCount.total}`}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#ea580c' }}
                />
              </Card>
            </Col>
          </Row>

          {/* GMV 趋势 + 广告 ROI */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={14}>
              <Card title={<><LineChartOutlined /> {t('biz.gmvTrend')}</>}>
                <div className="trend-chart" aria-label={t('biz.gmvTrend')}>
                  {biz.gmvTrend.map((point) => (
                    <div className="trend-column" key={point.date}>
                      <div className="trend-bars">
                        <span className="trend-bar trend-bar-runs" style={{ height: `${(point.gmv / 35000) * 140}px` }} title={`GMV: $${formatNumber(point.gmv)}`} />
                        <span className="trend-bar trend-bar-approvals" style={{ height: `${Math.max(8, (point.orders / 500) * 140)}px` }} title={`${t('biz.orders')}: ${point.orders}`} />
                      </div>
                      <Typography.Text type="secondary">{point.date}</Typography.Text>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <span><i className="legend-dot legend-runs" />GMV</span>
                  <span><i className="legend-dot legend-approvals" />{t('biz.orders')}</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card title={<><FireOutlined /> {t('biz.adRoi')}</>} style={{ marginBottom: 16 }}>
                <Row gutter={[8, 12]}>
                  <Col span={12}><Statistic title={t('biz.adSpend')} value={biz.adMetrics.todaySpend} prefix="$" valueStyle={{ fontSize: 20 }} /></Col>
                  <Col span={12}><Statistic title={t('biz.roas')} value={biz.adMetrics.roas} precision={1} suffix="x" valueStyle={{ fontSize: 20, color: biz.adMetrics.roas > biz.adMetrics.targetRoas ? '#16a34a' : '#ea580c' }} /></Col>
                  <Col span={12}><Statistic title="CPM" value={biz.adMetrics.cpm} prefix="$" precision={1} valueStyle={{ fontSize: 18 }} /></Col>
                  <Col span={12}><Statistic title="CPC" value={biz.adMetrics.cpc} prefix="$" precision={2} valueStyle={{ fontSize: 18 }} /></Col>
                  <Col span={12}><Statistic title="CTR" value={biz.adMetrics.ctr} suffix="%" precision={1} valueStyle={{ fontSize: 18 }} /></Col>
                  <Col span={12}><Statistic title="CVR" value={biz.adMetrics.cvr} suffix="%" precision={1} valueStyle={{ fontSize: 18 }} /></Col>
                </Row>
                <div style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary">{t('biz.adBudget')}: {formatCurrency(biz.adMetrics.todaySpend)} / {formatCurrency(biz.adMetrics.budgetLimit)}</Typography.Text>
                  <Progress percent={Math.round((biz.adMetrics.todaySpend / biz.adMetrics.budgetLimit) * 100)} status={biz.adMetrics.todaySpend > biz.adMetrics.budgetLimit ? 'exception' : 'active'} size="small" />
                </div>
              </Card>
            </Col>
          </Row>

          {/* 售后 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title={<><BellOutlined /> {t('biz.afterSales')}</>} size="small">
                <Row gutter={[16, 12]}>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.returnRate')} value={biz.afterSales.returnRate} suffix="%" valueStyle={{ color: biz.afterSales.returnRate > 3 ? '#dc2626' : '#16a34a', fontSize: 20 }} />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.negativeReviews')} value={`${biz.afterSales.negativeReviews}`} suffix={<span style={{ fontSize: 12 }}>{t('biz.unresolved')} {biz.afterSales.negativeReviews - biz.afterSales.respondedReviews}</span>} valueStyle={{ color: '#ea580c', fontSize: 20 }} />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.storeRating')} value={biz.afterSales.storeRating} suffix="/5.0" valueStyle={{ color: biz.afterSales.storeRating >= 4.5 ? '#16a34a' : '#ea580c', fontSize: 20 }} />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.returnAmount')} value={biz.afterSales.returnAmount} prefix="$" valueStyle={{ fontSize: 18 }} />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.replyRate')} value={biz.afterSales.reviewResponseRate} suffix="%" valueStyle={{ fontSize: 18 }} />
                  </Col>
                  <Col xs={12} sm={8} md={4}>
                    <Statistic title={t('biz.avgResponse')} value={biz.afterSales.avgResponseMinutes} suffix="min" valueStyle={{ fontSize: 18 }} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* 店铺 GMV 排名 + 库存 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={<><TrophyOutlined /> {t('biz.storeRanking')}</>} size="small">
                {biz.storeGmvRank.map((store, idx) => (
                  <div key={store.storeName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Space>
                      <Tag color={idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}>#{idx + 1}</Tag>
                      <div>
                        <Typography.Text strong>{store.storeName}</Typography.Text>
                        <br />
                        <Typography.Text type="secondary">{store.platform}</Typography.Text>
                      </div>
                    </Space>
                    <Typography.Text strong style={{ color: '#2563eb' }}>${formatNumber(store.gmv)}</Typography.Text>
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><BarChartOutlined /> {t('biz.inventory')}</>} size="small">
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <Card size="small"><Statistic title={t('biz.totalSkus')} value={biz.inventory.totalSkus} valueStyle={{ fontSize: 20 }} /></Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small"><Statistic title={t('biz.lowStock')} value={biz.inventory.lowStockCount} valueStyle={{ fontSize: 20, color: '#ea580c' }} /></Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small"><Statistic title={t('biz.slowMoving')} value={biz.inventory.slowMovingCount} valueStyle={{ fontSize: 20, color: '#7c3aed' }} /></Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small"><Statistic title={t('biz.outOfStock')} value={biz.inventory.outOfStockCount} valueStyle={{ fontSize: 20, color: '#dc2626' }} /></Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

// ===== 运维监控（运营视角） =====

function OpsMonitor() {
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
    <>
      {/* 运维核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Space><span style={{ color: '#2563eb', fontSize: 24 }}><ShopOutlined /></span><Statistic title={t('dashboard.connectedStores')} value={data?.connectedStores ?? 0} /></Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{t('dashboard.storeMetricMeta')}</Typography.Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Space><span style={{ color: '#0f766e', fontSize: 24 }}><RobotOutlined /></span><Statistic title={t('dashboard.runningTasks')} value={data?.runningTasks ?? 0} /></Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{t('dashboard.taskMetricMeta')}</Typography.Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Space><span style={{ color: '#ea580c', fontSize: 24 }}><CheckSquareOutlined /></span><Statistic title={t('dashboard.pendingApprovals')} value={data?.pendingApprovals ?? 0} /></Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{t('dashboard.approvalMetricMeta')}</Typography.Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Space><span style={{ color: '#dc2626', fontSize: 24 }}><AlertOutlined /></span><Statistic title={t('dashboard.loginRequired')} value={data?.loginRequiredStores ?? 0} /></Space>
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{t('dashboard.loginMetricMeta')}</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title={<><LineChartOutlined /> {t('dashboard.trendTitle')}</>} extra={<Typography.Text type="secondary">{t('dashboard.trendDescription')}</Typography.Text>}>
            <div className="trend-chart" aria-label={t('dashboard.trendTitle')}>
              {data?.operationTrend.map((point) => (
                <div className="trend-column" key={point.dayKey}>
                  <div className="trend-bars">
                    <span className="trend-bar trend-bar-runs" style={{ height: `${Math.max(12, (point.runs / trendMax) * 150)}px` }} title={`${t('dashboard.runs')}: ${point.runs}`} />
                    <span className="trend-bar trend-bar-approvals" style={{ height: `${Math.max(8, (point.approvals / trendMax) * 150)}px` }} title={`${t('dashboard.approvalShort')}: ${point.approvals}`} />
                    <span className="trend-bar trend-bar-failures" style={{ height: `${Math.max(6, (point.failures / trendMax) * 150)}px` }} title={`${t('dashboard.failures')}: ${point.failures}`} />
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
          <Card title={<><DashboardOutlined /> {t('dashboard.taskStatusTitle')}</>}>
            <div className="status-visual">
              <div className="donut-chart" style={{ background: `conic-gradient(${donutGradient})` }}>
                <div><strong>{statusTotal}</strong><span>{t('entity.task')}</span></div>
              </div>
              <div className="status-list">
                {data?.taskStatusBreakdown.map((item) => (
                  <div className="status-row" key={item.status}>
                    <span className="status-label"><i style={{ background: statusColors[item.status] }} />{t(`status.${item.status}`)}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <DashboardLiveFeed tasks={data?.recentTasks ?? []} approvals={data?.recentApprovals ?? []} />
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
                      <Typography.Text type="secondary">  {formatNumber(item.used)} / {formatNumber(item.limit)}</Typography.Text>
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
            {data?.agentMix.map((item) => {
              const maxCount = Math.max(...(data?.agentMix.map((agent) => agent.count) ?? [1]));
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div className="agent-mix-row" key={item.agentType}>
                  <div className="agent-mix-header">
                    <Typography.Text strong>{t(`agent.${item.agentType}`)}</Typography.Text>
                    <Typography.Text strong style={{ color: item.color }}>{item.count}</Typography.Text>
                  </div>
                  <div className="agent-mix-bar-track">
                    <div className="agent-mix-bar" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={t('dashboard.healthTitle')}>
            <div className="health-list">
              {data?.healthSignals.map((item) => (
                <div className="health-row" key={item.key}>
                  <Typography.Text>{t(item.key)}</Typography.Text>
                  <Tag color={item.status === 'healthy' ? 'green' : item.status === 'warning' ? 'orange' : 'red'}>{t(`dashboard.${item.status}`)}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}

// ===== 主页面 =====

export function DashboardPage() {
  const { t } = useI18n();
  return (
    <div className="page-stack">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />
      <Tabs
        defaultActiveKey="business"
        size="large"
        items={[
          { key: 'business', label: <><DollarOutlined /> {t('biz.overview')}</>, children: <BusinessOverview /> },
          { key: 'ops', label: <><DashboardOutlined /> {t('dashboard.opsMonitor')}</>, children: <OpsMonitor /> }
        ]}
      />
    </div>
  );
}
