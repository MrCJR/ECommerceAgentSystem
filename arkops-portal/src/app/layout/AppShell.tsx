import {
  AlertOutlined,
  AuditOutlined,
  BarChartOutlined,
  BellOutlined,
  BookOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  DesktopOutlined,
  DollarOutlined,
  ExperimentOutlined,
  MoonOutlined,
  RobotOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
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

  const pendingApprovals = dashboard?.pendingApprovals ?? 0;
  const exceptionPending = dashboard?.exceptionCenterPending ?? 0;
  const orderExceptions = dashboard?.orderExceptions ?? 0;
  const loginRequired = dashboard?.loginRequiredStores ?? 0;

  const menuItems = [
    // 1. 控制台 — 第一眼看到的全局概览
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('nav.dashboard') },

    // 2. 异常中心 — 最紧急的待处理异常
    {
      key: '/exception-center',
      icon: <AlertOutlined />,
      label: (
        <span>
          {t('nav.exceptions')}
          {exceptionPending > 0 && (
            <Badge count={exceptionPending} size="small" offset={[8, -2]} style={{ marginLeft: 8 }} />
          )}
        </span>
      )
    },

    // 3. 审批中心 — 等待决策的高风险操作
    {
      key: '/approvals',
      icon: <CheckSquareOutlined />,
      label: (
        <span>
          {t('nav.approvals')}
          {pendingApprovals > 0 && (
            <Badge count={pendingApprovals} size="small" offset={[8, -2]} style={{ marginLeft: 8 }} />
          )}
        </span>
      )
    },

    // 4. 订单自动化 — 日常订单处理
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: (
        <span>
          {t('nav.orders')}
          {orderExceptions > 0 && (
            <Badge count={orderExceptions} size="small" offset={[8, -2]} style={{ marginLeft: 8 }} />
          )}
        </span>
      )
    },

    // 5. 店铺管理 — 基础设施（连接店铺是一切的前提）
    {
      key: '/stores',
      icon: <ShopOutlined />,
      label: (
        <span>
          {t('nav.stores')}
          {loginRequired > 0 && (
            <Badge count={loginRequired} size="small" offset={[8, -2]} style={{ marginLeft: 8 }} />
          )}
        </span>
      )
    },

    // 6. Agent 中心 — 自动化配置
    { key: '/agents', icon: <RobotOutlined />, label: t('nav.agents') },

    // 7. 模型中心 — AI 能力管理
    { key: '/models', icon: <ExperimentOutlined />, label: t('nav.models') },

    // 8. 经营中心 — 成本与产品分析
    { key: '/operations', icon: <BarChartOutlined />, label: t('nav.operations') },

    // 9. 审计日志 — 操作追溯
    { key: '/audit-logs', icon: <AuditOutlined />, label: t('nav.auditLogs') },

    // 10. 财务台账 — 费用与订阅
    { key: '/billing', icon: <DollarOutlined />, label: t('nav.billing') },

    // 11. 使用说明 — 帮助文档
    { key: '/guide', icon: <BookOutlined />, label: t('nav.guide') },

    // 12. 设置 — 团队与通知配置
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      children: [
        { key: '/settings/members', icon: <TeamOutlined />, label: t('nav.members') },
        { key: '/settings/notifications', icon: <BellOutlined />, label: t('nav.notifications') }
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
