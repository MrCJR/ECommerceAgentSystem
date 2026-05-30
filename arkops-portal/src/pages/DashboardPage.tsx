import { AlertOutlined, CheckSquareOutlined, RobotOutlined, ShopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, List, Row, Statistic, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.getSummary });

  return (
    <div className="page-stack">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <div className="metric-grid">
        <Card>
          <Statistic title={t('dashboard.connectedStores')} value={data?.connectedStores ?? 0} prefix={<ShopOutlined />} />
        </Card>
        <Card>
          <Statistic title={t('dashboard.runningTasks')} value={data?.runningTasks ?? 0} prefix={<RobotOutlined />} />
        </Card>
        <Card>
          <Statistic title={t('dashboard.pendingApprovals')} value={data?.pendingApprovals ?? 0} prefix={<CheckSquareOutlined />} />
        </Card>
        <Card>
          <Statistic title={t('dashboard.loginRequired')} value={data?.loginRequiredStores ?? 0} prefix={<AlertOutlined />} />
        </Card>
      </div>
      <Row gutter={16}>
        <Col span={14}>
          <Card title={t('dashboard.recentTasks')}>
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
        <Col span={10}>
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
