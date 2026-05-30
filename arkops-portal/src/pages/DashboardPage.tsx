import { AlertOutlined, CheckSquareOutlined, RobotOutlined, ShopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, List, Row, Statistic, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.getSummary });

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="Operational control overview for stores, Agent tasks, approvals, and runtime alerts."
      />
      <div className="metric-grid">
        <Card>
          <Statistic title="Connected stores" value={data?.connectedStores ?? 0} prefix={<ShopOutlined />} />
        </Card>
        <Card>
          <Statistic title="Running tasks" value={data?.runningTasks ?? 0} prefix={<RobotOutlined />} />
        </Card>
        <Card>
          <Statistic title="Pending approvals" value={data?.pendingApprovals ?? 0} prefix={<CheckSquareOutlined />} />
        </Card>
        <Card>
          <Statistic title="Login required" value={data?.loginRequiredStores ?? 0} prefix={<AlertOutlined />} />
        </Card>
      </div>
      <Row gutter={16}>
        <Col span={14}>
          <Card title="Recent Agent tasks">
            <List
              dataSource={data?.recentTasks}
              renderItem={(task) => (
                <List.Item actions={[<Link to={`/tasks/${task.id}`}>View</Link>]}>
                  <List.Item.Meta title={task.title} description={task.goal} />
                  <StatusBadge value={task.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Approval queue">
            <List
              dataSource={data?.recentApprovals}
              renderItem={(approval) => (
                <List.Item actions={[<Link to={`/approvals/${approval.id}`}>Review</Link>]}>
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
