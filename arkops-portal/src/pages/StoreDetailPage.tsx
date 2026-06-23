import {
  ApiOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
  FireOutlined,
  LinkOutlined,
  PlusOutlined,
  RiseOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StopOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WalletOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Descriptions, Form, Input, Modal, Progress, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storeBusinessApi } from '../api/storeBusiness';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Store, StoreBusinessDetail, StoreConnection, StoreServiceType } from '../types/domain';

export function StoreDetailPage({ mode }: { mode?: 'new' }) {
  const { t } = useI18n();
  const { storeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storesApi.get(storeId!),
    enabled: Boolean(storeId) && mode !== 'new'
  });
  const { data: storeBiz } = useQuery({
    queryKey: ['store-biz', storeId],
    queryFn: () => storeBusinessApi.getDetail(storeId!),
    enabled: Boolean(storeId) && mode !== 'new'
  });
  const createStore = useMutation({
    mutationFn: storesApi.create,
    onSuccess: (created) => navigate(`/stores/${created.id}`)
  });
  const revokeMutation = useMutation({
    mutationFn: () => storesApi.updateStatus(storeId!, 'revoked'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store', storeId] })
  });
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [connectionForm] = Form.useForm();
  const addConnectionMutation = useMutation({
    mutationFn: (values: { serviceName: string; serviceType: StoreServiceType; authMethod: Store['authMethod']; apiKey?: string; account?: string }) =>
      storesApi.addConnection(storeId!, values),
    onSuccess: () => {
      message.success(t('stores.connectionAdded'));
      queryClient.invalidateQueries({ queryKey: ['store', storeId] });
      setConnectionModalOpen(false);
      connectionForm.resetFields();
    }
  });

  const [authMethod, setAuthMethod] = useState<Store['authMethod'] | undefined>();
  const [platform, setPlatform] = useState<string>('tiktok_shop');

  if (mode === 'new') {
    const authMethods: { value: Store['authMethod']; label: string; desc: string; platforms: string[] }[] = [
      { value: 'credentials', label: t('stores.authCredentials'), desc: t('stores.authCredentialsDesc'), platforms: ['tiktok_shop', 'amazon', 'shopee', 'lazada', 'temu', 'ebay'] },
      { value: 'api_key', label: t('stores.authApiKey'), desc: t('stores.authApiKeyDesc'), platforms: ['shopify', 'amazon', 'ebay'] },
      { value: 'oauth', label: t('stores.authOauth'), desc: t('stores.authOauthDesc'), platforms: ['shopify', 'amazon'] }
    ];

    return (
      <div className="page-stack">
        <PageHeader title={t('stores.addTitle')} description={t('stores.addDescription')} />
        {/* 步骤1：店铺信息 */}
        <Card title={t('stores.stepPlatform')} style={{ marginBottom: 16 }}>
          <Form.Item label={t('stores.name')} name="storeName" rules={[{ required: true }]}>
            <Input placeholder={t('stores.namePlaceholder')} onChange={(e) => form.setFieldsValue({ name: e.target.value })} />
          </Form.Item>
          <Form.Item label={t('stores.platform')}>
            <Select
              value={platform}
              onChange={(v) => { setPlatform(v); setAuthMethod(undefined); }}
              options={[
                { value: 'tiktok_shop', label: 'TikTok Shop' }, { value: 'amazon', label: 'Amazon' },
                { value: 'shopify', label: 'Shopify' }, { value: 'shopee', label: 'Shopee' },
                { value: 'lazada', label: 'Lazada' }, { value: 'temu', label: 'Temu' }, { value: 'ebay', label: 'eBay' }
              ]}
            />
          </Form.Item>
        </Card>

        {/* 步骤2：授权方式 */}
        <Card title={t('stores.stepAuth')} style={{ marginBottom: 16 }}>
          <Typography.Paragraph type="secondary">{t('stores.chooseAuth')}</Typography.Paragraph>
          <Row gutter={[12, 12]}>
            {authMethods.filter((m) => m.platforms.includes(platform)).map((m) => (
              <Col xs={24} sm={12} key={m.value}>
                <Card hoverable size="small"
                  style={{ border: authMethod === m.value ? '2px solid #2563eb' : '1px solid #e8e8e8', cursor: 'pointer' }}
                  onClick={() => setAuthMethod(m.value)}>
                  <Typography.Text strong>{m.label}</Typography.Text><br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{m.desc}</Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 步骤3：授权配置 */}
        {authMethod && (
          <Card title={<><SettingOutlined /> {t('stores.stepConfig')}</>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => createStore.mutate({
                name: values.name, platform, authMethod,
                apiKey: values.apiKey, apiSecret: values.apiSecret, account: values.account,
                region: values.region, currency: values.currency
              })}
            >
              <Form.Item name="name" hidden><Input /></Form.Item>

              {/* --- 授权配置区 --- */}
              <Typography.Title level={5} style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                <LinkOutlined style={{ marginRight: 8 }} />{t('stores.primaryAuth')}
              </Typography.Title>

              {authMethod === 'credentials' && (
                <>
                  <div style={{ padding: 16, background: '#f0f5ff', borderRadius: 8, marginBottom: 16 }}>
                    <Typography.Text>{t('stores.credentialsNote')}</Typography.Text>
                  </div>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label={t('stores.account')} name="account" rules={[{ required: true }]}><Input placeholder="seller@example.com" /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label={t('stores.password')} name="password"><Input.Password placeholder={t('stores.passwordPlaceholder')} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label={t('stores.region')} name="region"><Select allowClear placeholder="US" options={[
                      { value: 'US', label: 'United States' }, { value: 'UK', label: 'United Kingdom' },
                      { value: 'SG', label: 'Singapore' }, { value: 'ID', label: 'Indonesia' }
                    ]} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label={t('stores.currency')} name="currency" initialValue="USD"><Select options={[
                      { value: 'USD', label: 'USD' }, { value: 'GBP', label: 'GBP' },
                      { value: 'SGD', label: 'SGD' }, { value: 'CNY', label: 'CNY' }, { value: 'EUR', label: 'EUR' }
                    ]} /></Form.Item></Col>
                  </Row>
                </>
              )}

              {authMethod === 'api_key' && (
                <Row gutter={16}>
                  <Col xs={24} sm={12}><Form.Item label={t('stores.apiKeyLabel')} name="apiKey" rules={[{ required: true }]}><Input placeholder="shpat_xxxxxxxxxxxx" /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item label={t('stores.apiSecretLabel')} name="apiSecret" rules={[{ required: true }]}><Input.Password placeholder={t('stores.apiSecretPlaceholder')} /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item label={t('stores.region')} name="region"><Select allowClear placeholder="US" options={[
                    { value: 'US', label: 'United States' }, { value: 'UK', label: 'United Kingdom' }, { value: 'SG', label: 'Singapore' }
                  ]} /></Form.Item></Col>
                </Row>
              )}

              {authMethod === 'oauth' && (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <Typography.Title level={5}>{t('stores.oauthTitle')}</Typography.Title>
                  <Typography.Paragraph type="secondary">{t('stores.oauthDesc')}</Typography.Paragraph>
                  <Button type="primary" size="large" icon={<LinkOutlined />} onClick={() => message.info(t('stores.oauthMock'))}>
                    {t('stores.oauthConnect', { platform: platform === 'shopify' ? 'Shopify' : 'Amazon' })}
                  </Button>
                  <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>{t('stores.oauthMockNote')}</Typography.Paragraph>
                </div>
              )}

              {/* 提交按钮 */}
              <Button type="primary" htmlType="submit" loading={createStore.isPending} block size="large" style={{ marginTop: 24 }}>
                {t('stores.create')}
              </Button>
            </Form>
          </Card>
        )}
      </div>
    );
  }

  const serviceTypeIcons: Record<string, JSX.Element> = {
    store_backend: <ShopOutlined />,
    advertising: <ThunderboltOutlined />,
    customer_service: <CustomerServiceOutlined />,
    logistics: <ShoppingCartOutlined />,
    finance: <WalletOutlined />,
    other: <ApiOutlined />
  };

  const connectionColumns: ColumnsType<StoreConnection> = [
    {
      title: t('stores.serviceName'),
      dataIndex: 'serviceName',
      render: (name: string, record) => (
        <Space>
          {serviceTypeIcons[record.serviceType] ?? <ApiOutlined />}
          <Typography.Text>{name}</Typography.Text>
        </Space>
      )
    },
    {
      title: t('stores.serviceType'),
      dataIndex: 'serviceType',
      render: (type: StoreServiceType) => (
        <Tag>{t(`stores.service_${type}`)}</Tag>
      )
    },
    {
      title: t('stores.authMethod'),
      dataIndex: 'authMethod',
      render: (method: Store['authMethod']) => {
        const labels: Record<string, string> = { credentials: t('stores.authCredentials'), api_key: t('stores.authApiKey'), oauth: t('stores.authOauth') };
        return <Tag>{labels[method] ?? method}</Tag>;
      }
    },
    {
      title: t('stores.status'),
      dataIndex: 'status',
      render: (status: string) => <StatusBadge value={status as Store['status']} />
    },
    {
      title: t('stores.lastVerified'),
      dataIndex: 'lastVerifiedAt',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'
    }
  ];

  const settingsTab = (
    <>
      {/* 店铺主体授权 */}
      <Card title={<><LinkOutlined /> {t('stores.primaryAuth')}</>} style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label={t('stores.platform')}>{store?.platform}</Descriptions.Item>
          <Descriptions.Item label={t('stores.authMethod')}>
            <Tag color={store?.authMethod === 'credentials' ? 'orange' : store?.authMethod === 'api_key' ? 'green' : 'purple'}>
              {store?.authMethod === 'credentials' ? t('stores.authCredentials') : store?.authMethod === 'api_key' ? t('stores.authApiKey') : t('stores.authOauth')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('stores.status')}>{store ? <StatusBadge value={store.status} /> : null}</Descriptions.Item>

          {store?.apiKey && <Descriptions.Item label="API Key"><Typography.Text code>{store.apiKey}</Typography.Text></Descriptions.Item>}
          {store?.account && <Descriptions.Item label={t('stores.account')}>{store.account}</Descriptions.Item>}
          {store?.region && <Descriptions.Item label={t('stores.region')}>{store.region}</Descriptions.Item>}
          {store?.currency && <Descriptions.Item label={t('stores.currency')}>{store.currency}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* 服务授权 */}
      <Card
        title={<><ApiOutlined /> {t('stores.serviceAuth')} ({store?.connections?.length ?? 0})</>}
        extra={<Button icon={<PlusOutlined />} onClick={() => setConnectionModalOpen(true)}>{t('stores.addService')}</Button>}
        style={{ marginBottom: 16 }}
      >
        {(!store?.connections || store.connections.length === 0) ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            <Typography.Paragraph type="secondary">{t('stores.noConnections')}</Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>{t('stores.noConnectionsHint')}</Typography.Paragraph>
          </div>
        ) : (
          <Table rowKey="id" columns={connectionColumns} dataSource={store.connections} pagination={false} size="small" />
        )}
      </Card>

      {/* 添加服务弹窗 */}
      <Modal
        title={t('stores.addService')}
        open={connectionModalOpen}
        onOk={() => connectionForm.submit()}
        onCancel={() => { setConnectionModalOpen(false); connectionForm.resetFields(); }}
        confirmLoading={addConnectionMutation.isPending}
      >
        <Form form={connectionForm} layout="vertical" onFinish={(values) => addConnectionMutation.mutate(values)} initialValues={{ serviceType: 'advertising', authMethod: 'credentials' }}>
          <Form.Item label={t('stores.serviceName')} name="serviceName" rules={[{ required: true }]}><Input placeholder={t('stores.serviceNamePlaceholder')} /></Form.Item>
          <Form.Item label={t('stores.serviceType')} name="serviceType" rules={[{ required: true }]}>
            <Select options={[
              { value: 'advertising', label: <><ThunderboltOutlined /> {t('stores.service_advertising')}</> },
              { value: 'customer_service', label: <><CustomerServiceOutlined /> {t('stores.service_customer_service')}</> },
              { value: 'logistics', label: <><ShoppingCartOutlined /> {t('stores.service_logistics')}</> },
              { value: 'finance', label: <><WalletOutlined /> {t('stores.service_finance')}</> },
              { value: 'other', label: <><ApiOutlined /> {t('stores.service_other')}</> }
            ]} />
          </Form.Item>
          <Form.Item label={t('stores.authMethod')} name="authMethod" rules={[{ required: true }]}>
            <Select options={[
              { value: 'credentials', label: t('stores.authCredentials') },
              { value: 'api_key', label: t('stores.authApiKey') }
            ]} />
          </Form.Item>
          <Form.Item label={t('stores.account')} name="account"><Input placeholder="seller@example.com" /></Form.Item>
          <Form.Item label="API Key" name="apiKey"><Input placeholder="shpat_xxxxxxxxxxxx" /></Form.Item>
        </Form>
      </Modal>
    </>
  );

  const bizTab = !storeBiz ? null : (
    <>
      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-primary">
            <div className="stat-card-icon"><DollarOutlined /></div>
            <Statistic
              title={t('biz.todayGmv')}
              value={storeBiz.gmv.today}
              prefix="$"
              valueStyle={{ color: '#2563eb', fontWeight: 700, fontSize: 26 }}
              suffix={
                <span style={{ fontSize: 14, fontWeight: 600, color: storeBiz.gmv.today >= storeBiz.gmv.yesterday ? '#16a34a' : '#dc2626' }}>
                  {storeBiz.gmv.today >= storeBiz.gmv.yesterday ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {' '}{Math.abs(Math.round(((storeBiz.gmv.today - storeBiz.gmv.yesterday) / storeBiz.gmv.yesterday) * 100))}%
                </span>
              }
            />
            <Typography.Text type="secondary">{t('biz.vsYesterday')} ${storeBiz.gmv.yesterday.toLocaleString()}</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-success">
            <div className="stat-card-icon"><ShoppingCartOutlined /></div>
            <Statistic
              title={t('biz.todayOrders')}
              value={storeBiz.orders.today}
              valueStyle={{ color: '#0f766e', fontWeight: 700, fontSize: 26 }}
              suffix={
                <span style={{ fontSize: 14, fontWeight: 600, color: storeBiz.orders.today >= storeBiz.orders.yesterday ? '#16a34a' : '#dc2626' }}>
                  {storeBiz.orders.today >= storeBiz.orders.yesterday ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {' '}{Math.abs(Math.round(((storeBiz.orders.today - storeBiz.orders.yesterday) / storeBiz.orders.yesterday) * 100))}%
                </span>
              }
            />
            <Typography.Text type="secondary">{t('biz.vsYesterday')} {storeBiz.orders.yesterday} {t('biz.orders')}</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-purple">
            <div className="stat-card-icon"><RiseOutlined /></div>
            <Statistic
              title={t('biz.aov')}
              value={storeBiz.aov}
              prefix="$"
              precision={1}
              valueStyle={{ color: '#7c3aed', fontWeight: 700, fontSize: 26 }}
            />
            <Typography.Text type="secondary">{t('biz.aovHint')}</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-warning">
            <div className="stat-card-icon"><TrophyOutlined /></div>
            <Statistic
              title={t('biz.storeRating')}
              value={storeBiz.afterSales.storeRating}
              suffix="/5.0"
              valueStyle={{ color: storeBiz.afterSales.storeRating >= 4.5 ? '#16a34a' : '#ea580c', fontWeight: 700, fontSize: 26 }}
            />
            <Typography.Text type="secondary">{t('biz.ratingHint')}</Typography.Text>
          </Card>
        </Col>
      </Row>

      {/* GMV 趋势 + 广告投放 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={<><DollarOutlined /> {t('biz.gmvTrend')}</>} size="small" className="trend-card">
            <div className="trend-chart">
              {storeBiz.gmv.trend.map((p, i) => (
                <div className="trend-column" key={p.date}>
                  <div className="trend-bars">
                    <span className="trend-bar trend-bar-gmv" style={{ height: `${Math.max(16, (p.value / Math.max(...storeBiz.gmv.trend.map(x => x.value), 1)) * 140)}px` }} title={`GMV: $${p.value}`} />
                    <span className="trend-bar trend-bar-orders" style={{ height: `${Math.max(10, ((storeBiz.orders.trend[i]?.value ?? 0) / Math.max(...storeBiz.orders.trend.map(x => x.value), 1)) * 140)}px` }} title={`${t('biz.orders')}: ${storeBiz.orders.trend[i]?.value ?? 0}`} />
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{p.date}</Typography.Text>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><i className="legend-dot legend-gmv" />GMV</span>
              <span><i className="legend-dot legend-orders" />{t('biz.orders')}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><FireOutlined /> {t('biz.adRoi')}</>} size="small" className="ad-card">
            <Row gutter={[8, 12]}>
              <Col span={12}>
                <div className="ad-stat">
                  <Typography.Text type="secondary">{t('biz.adSpend')}</Typography.Text>
                  <Typography.Title level={4} style={{ margin: '4px 0', color: '#2563eb' }}>${storeBiz.adMetrics.todaySpend}</Typography.Title>
                </div>
              </Col>
              <Col span={12}>
                <div className="ad-stat">
                  <Typography.Text type="secondary">ROAS</Typography.Text>
                  <Typography.Title level={4} style={{ margin: '4px 0', color: storeBiz.adMetrics.roas >= 4 ? '#16a34a' : '#ea580c' }}>{storeBiz.adMetrics.roas}x</Typography.Title>
                </div>
              </Col>
              <Col span={8}>
                <div className="ad-stat">
                  <Typography.Text type="secondary">CPM</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 15 }}>${storeBiz.adMetrics.cpm}</Typography.Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="ad-stat">
                  <Typography.Text type="secondary">CPC</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 15 }}>${storeBiz.adMetrics.cpc}</Typography.Text>
                </div>
              </Col>
              <Col span={8}>
                <div className="ad-stat">
                  <Typography.Text type="secondary">CVR</Typography.Text>
                  <Typography.Text strong style={{ fontSize: 15 }}>{storeBiz.adMetrics.cvr}%</Typography.Text>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text type="secondary">{t('biz.adBudget')}</Typography.Text>
                <Tag color={storeBiz.adMetrics.todaySpend > storeBiz.adMetrics.budgetLimit ? 'red' : 'blue'}>${storeBiz.adMetrics.todaySpend} / ${storeBiz.adMetrics.budgetLimit}</Tag>
              </div>
              <Progress percent={Math.round((storeBiz.adMetrics.todaySpend / storeBiz.adMetrics.budgetLimit) * 100)} size="small" showInfo={false} status={storeBiz.adMetrics.todaySpend > storeBiz.adMetrics.budgetLimit ? 'exception' : 'active'} />
            </div>
            <div>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{t('model.campaigns')}</Typography.Text>
              {storeBiz.adMetrics.campaigns.map((c) => (
                <div key={c.name} className="campaign-row">
                  <Typography.Text style={{ fontSize: 13 }}>{c.name}</Typography.Text>
                  <Space size="small">
                    <Typography.Text style={{ fontSize: 13, color: '#64748b' }}>${c.spend}</Typography.Text>
                    <Tag color={c.roi > 5 ? 'green' : c.roi > 2 ? 'orange' : 'red'}>ROI {c.roi}x</Tag>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 售后 + 库存 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<><WarningOutlined /> {t('biz.afterSales')}</>} size="small" className="section-card">
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Statistic
                  title={t('biz.returnRate')}
                  value={storeBiz.afterSales.returnRate}
                  suffix="%"
                  valueStyle={{ color: storeBiz.afterSales.returnRate > 3 ? '#dc2626' : '#16a34a', fontSize: 22, fontWeight: 600 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('biz.negativeReviews')}
                  value={storeBiz.afterSales.negativeReviews}
                  suffix={<span style={{ fontSize: 12, color: '#94a3b8' }}> / {t('biz.unresolved')} {storeBiz.afterSales.unresolvedReviews}</span>}
                  valueStyle={{ color: storeBiz.afterSales.negativeReviews > 0 ? '#ea580c' : '#16a34a', fontSize: 22, fontWeight: 600 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={t('biz.returnAmount')}
                  value={storeBiz.afterSales.returnAmount}
                  prefix="$"
                  valueStyle={{ fontSize: 22, fontWeight: 600 }}
                />
              </Col>
              <Col span={8}>
                <Statistic title={t('biz.disputes')} value={storeBiz.afterSales.disputes.pending} suffix={<span style={{ fontSize: 12, color: '#ea580c' }}>{t('biz.disputesHint')}</span>} valueStyle={{ color: storeBiz.afterSales.disputes.pending > 0 ? '#dc2626' : '#16a34a', fontSize: 22, fontWeight: 600 }} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> {t('biz.inventory')}</>} size="small" className="section-card">
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Statistic title={t('biz.totalSkus')} value={storeBiz.inventory.totalSkus} valueStyle={{ fontSize: 22, fontWeight: 600 }} />
              </Col>
              <Col span={8}>
                <Statistic title={t('biz.lowStock')} value={storeBiz.inventory.lowStockCount} valueStyle={{ color: '#ea580c', fontSize: 22, fontWeight: 600 }} />
              </Col>
              <Col span={8}>
                <Statistic title={t('biz.outOfStock')} value={storeBiz.inventory.outOfStockCount} valueStyle={{ color: '#dc2626', fontSize: 22, fontWeight: 600 }} />
              </Col>
              <Col span={8}>
                <Statistic title={t('biz.slowMoving')} value={storeBiz.inventory.slowMovingCount} valueStyle={{ color: '#64748b', fontSize: 22, fontWeight: 600 }} />
              </Col>
            </Row>
            {storeBiz.inventory.lowStockItems.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Typography.Text type="secondary" strong>{t('biz.lowStockItems')}</Typography.Text>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {storeBiz.inventory.lowStockItems.map((item) => (
                    <div key={item.sku} className="low-stock-row">
                      <Typography.Text style={{ fontSize: 13 }}>{item.name}</Typography.Text>
                      <Tag color="error">{item.stock} / {item.safetyStock}</Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* TOP 5 商品 */}
      <Card title={<><TrophyOutlined /> TOP 5 {t('biz.products')}</>} size="small" className="products-card">
        <Table
          rowKey="sku"
          dataSource={storeBiz.topProducts}
          pagination={false}
          size="small"
          columns={[
            { title: '#', render: (_: unknown, __: unknown, idx: number) => <Tag color={idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'} style={{ minWidth: 28, textAlign: 'center' }}>{idx + 1}</Tag>, width: 56 },
            { title: t('model.modelName'), dataIndex: 'name', render: (name: string) => <Typography.Text>{name}</Typography.Text> },
            { title: 'SKU', dataIndex: 'sku', render: (sku: string) => <Typography.Text code>{sku}</Typography.Text>, width: 140 },
            { title: 'GMV', dataIndex: 'gmv', render: (v: number) => <Typography.Text strong style={{ color: '#2563eb' }}>${v.toLocaleString()}</Typography.Text>, width: 100, align: 'right' },
            { title: t('biz.orders'), dataIndex: 'orders', width: 80, align: 'right' }
          ]}
        />
      </Card>
    </>
  );

  return (
    <div className="page-stack">
      <PageHeader
        title={store?.name ?? t('stores.detailTitle')}
        description={t('stores.detailDescription')}
        actions={
          <Button danger icon={<StopOutlined />} onClick={() => revokeMutation.mutate()} disabled={store?.status === 'revoked'}>
            {t('stores.revoke')}
          </Button>
        }
      />
      <Tabs
        defaultActiveKey="biz"
        items={[
          { key: 'biz', label: <><BarChartOutlined /> {t('biz.overview')}</>, children: bizTab },
          { key: 'settings', label: <><SettingOutlined /> {t('stores.settings')}</>, children: settingsTab }
        ]}
      />
    </div>
  );
}
