import {
  AuditOutlined,
  BellOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  RobotOutlined,
  ShopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Layout, Menu, Segmented, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

const { Header, Sider, Content } = Layout;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/stores', icon: <ShopOutlined />, label: t('nav.stores') },
    { key: '/tasks', icon: <RobotOutlined />, label: t('nav.tasks') },
    { key: '/approvals', icon: <CheckSquareOutlined />, label: t('nav.approvals') },
    { key: '/audit-logs', icon: <AuditOutlined />, label: t('nav.auditLogs') },
    {
      key: 'settings',
      icon: <TeamOutlined />,
      label: t('nav.settings'),
      children: [
        { key: '/settings/members', label: t('nav.members') },
        { key: '/settings/notifications', label: t('nav.notifications') },
        { key: '/settings/billing', label: t('nav.billing') }
      ]
    }
  ];

  return (
    <Layout className="app-shell">
      <Sider width={248} className="app-sider">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <Typography.Text strong>ArkOps</Typography.Text>
            <Typography.Text type="secondary" className="brand-subtitle">
              {t('app.subtitle')}
            </Typography.Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['settings']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space>
            <Badge status="processing" text={t('app.beta')} />
            <Typography.Text type="secondary">{t('app.tenant')}</Typography.Text>
          </Space>
          <Space>
            <Segmented
              size="small"
              value={language}
              onChange={(value) => setLanguage(value as 'en' | 'zh')}
              options={[
                { label: 'EN', value: 'en' },
                { label: '中文', value: 'zh' }
              ]}
            />
            <Button icon={<BellOutlined />}>{t('app.alerts')}</Button>
            <Avatar style={{ background: '#2563eb' }}>LP</Avatar>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
