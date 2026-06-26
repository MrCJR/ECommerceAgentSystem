import {
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  CrownOutlined,
  DashboardOutlined,
  DesktopOutlined,
  DollarOutlined,
  ExperimentOutlined,
  FundOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShopOutlined,
  SunOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Layout, Menu, Segmented, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { dashboardApi } from '../../api/dashboard';
import { useQuery } from '@tanstack/react-query';

const { Header, Sider, Content } = Layout;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const { mode, setMode } = useTheme();
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 30_000
  });
  const pendingCount = dashboard?.pendingApprovals ?? 0;

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/stores', icon: <ShopOutlined />, label: t('nav.stores') },
    { key: '/agents', icon: <SettingOutlined />, label: t('nav.agents') },
    { key: '/models', icon: <ExperimentOutlined />, label: t('nav.models') },
    { key: '/operations', icon: <FundOutlined />, label: t('nav.operations') },
    { key: '/approvals',
      icon: <CheckSquareOutlined />,
      label: (
        <span>
          {t('nav.approvals')}
          {pendingCount > 0 && (
            <Badge
              count={pendingCount}
              size="small"
              offset={[8, -2]}
              style={{ marginLeft: 8 }}
            />
          )}
        </span>
      )
    },
    { key: '/audit-logs', icon: <AuditOutlined />, label: t('nav.auditLogs') },
    { key: '/billing', icon: <DollarOutlined />, label: t('nav.billing') },
    { key: '/subscription', icon: <CrownOutlined />, label: t('nav.subscription') },
    {
      key: 'settings',
      icon: <TeamOutlined />,
      label: t('nav.settings'),
      children: [
        { key: '/settings/members', label: t('nav.members') },
        { key: '/settings/approval-policy', label: t('nav.approvalPolicy') },
        { key: '/settings/notifications', label: t('nav.notifications') },
        { key: '/settings/guide', label: t('nav.guide') }
      ]
    }
  ];

  return (
    <Layout className="app-shell">
      <Sider width={248} className="app-sider">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <Typography.Text strong>AllMall</Typography.Text>
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
              value={mode}
              onChange={(value) => setMode(value as 'system' | 'light' | 'dark')}
              options={[
                { label: <span title={t('theme.system')}><DesktopOutlined /></span>, value: 'system' },
                { label: <span title={t('theme.light')}><SunOutlined /></span>, value: 'light' },
                { label: <span title={t('theme.dark')}><MoonOutlined /></span>, value: 'dark' }
              ]}
            />
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
