import {
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  CrownOutlined,
  EditOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  SwapOutlined,
  TeamOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Descriptions, Divider, Form, Input, message, Row, Space, Statistic, Switch, Tag, Typography } from 'antd';
import { useState } from 'react';
import { financeApi } from '../api/finance';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';


// ========== 订阅计划 ==========

function PlansSection() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: currentPlan } = useQuery({ queryKey: ['currentPlan'], queryFn: financeApi.getCurrentPlan });
  const { data: allPlans } = useQuery({ queryKey: ['allPlans'], queryFn: financeApi.getAllPlans });
  const upgradeMutation = useMutation({
    mutationFn: financeApi.upgradePlan,
    onSuccess: () => {
      message.success(t('subscription.upgradeSuccess'));
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
    }
  });

  const colors: Record<string, string> = { Free: '#94a3b8', Starter: '#2563eb', Professional: '#7c3aed', Enterprise: '#ea580c' };
  const icons: Record<string, JSX.Element> = { Free: <RocketOutlined />, Starter: <RocketOutlined />, Professional: <CrownOutlined />, Enterprise: <RocketOutlined /> };

  return (
    <Card title={<><RocketOutlined /> {t('subscription.plans')}</>} style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {allPlans?.map((plan) => (
          <Col xs={24} sm={12} lg={6} key={plan.tier}>
            <Card
              style={{
                borderTop: `3px solid ${colors[plan.tier]}`,
                background: currentPlan?.tier === plan.tier ? 'var(--ark-panel-soft)' : undefined,
                height: '100%'
              }}
              actions={
                currentPlan?.tier === plan.tier
                  ? [<Tag color="blue" key="tag" style={{ margin: 0 }}>{t('subscription.currentPlan')}</Tag>]
                  : [<Button type="primary" onClick={() => upgradeMutation.mutate(plan.tier)} loading={upgradeMutation.isPending} key="upgrade" ghost>{t('subscription.upgrade')}</Button>]
              }
            >
              <Space style={{ marginBottom: 8 }}>
                {icons[plan.tier]}
                <Typography.Title level={5} style={{ margin: 0 }}>{plan.tier}</Typography.Title>
              </Space>
              <Statistic value={plan.price} prefix="$" suffix={t('subscription.perMonth')} valueStyle={{ fontSize: 24, color: colors[plan.tier], fontWeight: 700 }} />
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ lineHeight: 2.4, fontSize: 13 }}>
                <div><CheckCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />{plan.storeLimit === 999 ? t('subscription.unlimited') : `${plan.storeLimit} `}{t('subscription.stores')}</div>
                <div><CheckCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />{plan.monthlyOps === 99999 ? t('subscription.unlimited') : `${plan.monthlyOps.toLocaleString()} `}{t('subscription.monthlyOps')}</div>
                <div><CheckCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />{plan.agentConcurrency === 999 ? t('subscription.unlimited') : `${plan.agentConcurrency} `}{t('subscription.agentConcurrency')}</div>
                <div><CheckCircleOutlined style={{ color: '#16a34a', marginRight: 8 }} />{plan.tokenQuota === 99999999 ? t('subscription.unlimited') : `${(plan.tokenQuota / 1000).toFixed(0)}K `}Tokens</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

// ========== 当前套餐 + 续费周期 ==========

function CurrentPlanSection() {
  const { t } = useI18n();
  const { data: currentPlan } = useQuery({ queryKey: ['currentPlan'], queryFn: financeApi.getCurrentPlan });

  return (
    <Card title={<><CrownOutlined /> {t('subscription.currentPlan')}</>} style={{ marginBottom: 24 }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Statistic title={t('subscription.currentPlan')} value={currentPlan?.tier ?? '-'} valueStyle={{ color: '#2563eb', fontWeight: 700 }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic title={t('subscription.nextBillDate')} value="2026-07-01" valueStyle={{ fontWeight: 600 }} />
          <Typography.Text type="secondary">{t('subscription.autoRenew')} <Tag color="green" style={{ marginLeft: 4 }}>{t('subscription.autoRenewOn')}</Tag></Typography.Text>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Statistic title={t('subscription.billingCycle')} value={t('subscription.monthly')} prefix={<SwapOutlined />} valueStyle={{ fontWeight: 600 }} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{t('subscription.autoRenew')}</Typography.Text>
          <Switch defaultChecked />
          <Tag color="green" style={{ marginLeft: 8 }}>{t('subscription.autoRenewOn')}</Tag>
        </Col>
      </Row>
    </Card>
  );
}

// ========== 支付方式 ==========

function PaymentMethodsSection() {
  const { t } = useI18n();

  return (
    <Card title={<><WalletOutlined /> {t('subscription.paymentMethods')}</>} style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-primary" style={{ borderLeft: '3px solid #2563eb' }}>
            <div className="stat-card-icon"><CreditCardOutlined /></div>
            <Typography.Text strong>{t('subscription.creditCard')}</Typography.Text>
            <br />
            <Typography.Text type="secondary">Visa •••• 4242</Typography.Text>
            <br />
            <Tag color="green" style={{ marginTop: 8 }}>{t('subscription.default')}</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-purple" style={{ borderLeft: '3px solid #7c3aed' }}>
            <div className="stat-card-icon"><BankOutlined /></div>
            <Typography.Text strong>{t('subscription.bankTransfer')}</Typography.Text>
            <br />
            <Typography.Text type="secondary">{t('subscription.bankTransferDesc')}</Typography.Text>
            <br />
            <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }}>{t('subscription.viewDetails')}</Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-success" style={{ borderLeft: '3px solid #0f766e' }}>
            <div className="stat-card-icon"><SwapOutlined /></div>
            <Typography.Text strong>{t('subscription.transfer')}</Typography.Text>
            <br />
            <Typography.Text type="secondary">{t('subscription.transferDesc')}</Typography.Text>
            <br />
            <Button type="primary" size="small" ghost style={{ marginTop: 8 }}>{t('subscription.addPayment')}</Button>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

// ========== 发票信息 ==========

function InvoiceSection() {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const invoiceData = {
    companyName: '上海出海鲸科技有限公司',
    taxId: '91310000XXXXXXXXXX',
    address: '上海市浦东新区张江高科技园区XX路XX号',
    phone: '+86 21-XXXXXXXX',
    email: 'finance@chujingtech.com',
    bankName: '中国工商银行上海浦东分行',
    bankAccount: '1001 XXXX XXXX 1234 567'
  };

  return (
    <Card
      title={<><FileTextOutlined /> {t('subscription.invoice')}</>}
      extra={
        <Button icon={<EditOutlined />} onClick={() => { setEditing(!editing); if (!editing) form.setFieldsValue(invoiceData); }}>
          {editing ? t('common.cancel') : t('common.edit')}
        </Button>
      }
      style={{ marginBottom: 24 }}
    >
      {!editing ? (
        <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
          <Descriptions.Item label={t('subscription.companyName')}>{invoiceData.companyName}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.taxId')}>{invoiceData.taxId}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.address')}>{invoiceData.address}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.phone')}><PhoneOutlined /> {invoiceData.phone}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.email')}><MailOutlined /> {invoiceData.email}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.bankName')}><BankOutlined /> {invoiceData.bankName}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.bankAccount')}>{invoiceData.bankAccount}</Descriptions.Item>
          <Descriptions.Item label={t('subscription.invoiceType')}><Tag color="blue">{t('subscription.vatSpecial')}</Tag></Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" onFinish={(values) => { message.success(t('subscription.invoiceSaved')); setEditing(false); }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.companyName')} name="companyName" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.taxId')} name="taxId" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item label={t('subscription.address')} name="address"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.phone')} name="phone"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.email')} name="email"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.bankName')} name="bankName"><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label={t('subscription.bankAccount')} name="bankAccount"><Input /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">{t('common.save')}</Button>
        </Form>
      )}
    </Card>
  );
}

// ========== 对公打款信息 ==========

function BankTransferInfoSection() {
  const { t } = useI18n();

  return (
    <Card title={<><BankOutlined /> {t('subscription.bankTransferInfo')}</>} style={{ marginBottom: 24 }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={14}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('subscription.beneficiary')}>{t('subscription.beneficiaryName')}</Descriptions.Item>
            <Descriptions.Item label={t('subscription.bankName')}>AllMall Inc.</Descriptions.Item>
            <Descriptions.Item label={t('subscription.bankAddress')}>123 Tech Park Drive, Suite 400, San Francisco, CA 94105</Descriptions.Item>
            <Descriptions.Item label="SWIFT Code">ARKSUS6L</Descriptions.Item>
            <Descriptions.Item label={t('subscription.accountNumber')}>8844 1234 5678 9012</Descriptions.Item>
            <Descriptions.Item label="Routing (ACH)">121000248</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col xs={24} lg={10}>
          <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
            <Typography.Title level={5}>{t('subscription.transferNote')}</Typography.Title>
            <ul style={{ paddingLeft: 20, lineHeight: 2, color: '#64748b', fontSize: 13 }}>
              <li>{t('subscription.transferNote1')}</li>
              <li>{t('subscription.transferNote2')}</li>
              <li>{t('subscription.transferNote3')}</li>
              <li>{t('subscription.transferNote4')}</li>
            </ul>
            <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
              {t('subscription.transferNote5')}
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

// ========== 私有化部署说明 ==========

function PrivateDeploySection() {
  const { t } = useI18n();
  return (
    <Card
      title={<><SafetyCertificateOutlined /> {t('subscription.privateDeploy')}</>}
      style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f8fafb 0%, #f0f5ff 100%)' }}
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-primary" style={{ borderLeft: '3px solid #2563eb', height: '100%' }}>
            <div className="stat-card-icon"><BankOutlined /></div>
            <Typography.Title level={5}>{t('subscription.privateDeployTitle')}</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
              {t('subscription.privateDeployDesc')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-purple" style={{ borderLeft: '3px solid #7c3aed', height: '100%' }}>
            <div className="stat-card-icon"><RocketOutlined /></div>
            <Typography.Title level={5}>{t('subscription.agentCustom')}</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
              {t('subscription.agentCustomDesc')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-success" style={{ borderLeft: '3px solid #0f766e', height: '100%' }}>
            <div className="stat-card-icon"><CrownOutlined /></div>
            <Typography.Title level={5}>{t('subscription.modelCustom')}</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
              {t('subscription.modelCustomDesc')}
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
      <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-warning" style={{ borderLeft: '3px solid #ea580c', height: '100%' }}>
            <div className="stat-card-icon"><TeamOutlined /></div>
            <Typography.Title level={5}>{t('subscription.premiumSupport')}</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
              {t('subscription.premiumSupportDesc')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" className="stat-card stat-card-success" style={{ borderLeft: '3px solid #16a34a', height: '100%' }}>
            <div className="stat-card-icon"><ShopOutlined /></div>
            <Typography.Title level={5}>{t('subscription.dataIsolation')}</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 0 }}>
              {t('subscription.dataIsolationDesc')}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 8px' }}>
            <div>
              <Typography.Text>{t('subscription.contactSales')}</Typography.Text>
              <br />
              <Typography.Text strong style={{ fontSize: 16 }}>enterprise@allmall.com</Typography.Text>
              <br />
              <Typography.Text type="secondary">{t('subscription.contactSalesPhone')}</Typography.Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

// ========== 主页面 ==========

export function SubscriptionPage() {
  const { t } = useI18n();
  return (
    <div className="page-stack">
      <PageHeader title={t('subscription.title')} description={t('subscription.description')} />
      <CurrentPlanSection />
      <PlansSection />
      <PaymentMethodsSection />
      <InvoiceSection />
      <BankTransferInfoSection />
      <PrivateDeploySection />
    </div>
  );
}
