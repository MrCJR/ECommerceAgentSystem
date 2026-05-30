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
import { Avatar, Badge, Button, Layout, Menu, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/stores', icon: <ShopOutlined />, label: 'Stores' },
  { key: '/tasks', icon: <RobotOutlined />, label: 'Agent Tasks' },
  { key: '/approvals', icon: <CheckSquareOutlined />, label: 'Approvals' },
  { key: '/audit-logs', icon: <AuditOutlined />, label: 'Audit Logs' },
  {
    key: 'settings',
    icon: <TeamOutlined />,
    label: 'Settings',
    children: [
      { key: '/settings/members', label: 'Members' },
      { key: '/settings/notifications', label: 'Notifications' },
      { key: '/settings/billing', label: 'Billing & Quota' }
    ]
  }
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout className="app-shell">
      <Sider width={248} className="app-sider">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <Typography.Text strong>ArkOps</Typography.Text>
            <Typography.Text type="secondary" className="brand-subtitle">
              AI Commerce Ops
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
            <Badge status="processing" text="Internal Beta" />
            <Typography.Text type="secondary">Tenant: Demo Commerce Group</Typography.Text>
          </Space>
          <Space>
            <Button icon={<BellOutlined />}>Alerts</Button>
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
