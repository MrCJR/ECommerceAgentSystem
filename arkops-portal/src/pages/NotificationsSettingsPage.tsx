import { useQuery } from '@tanstack/react-query';
import { Button, Card, Descriptions, List, Switch } from 'antd';
import { settingsApi } from '../api/settings';
import { PageHeader } from '../components/PageHeader';

export function NotificationsSettingsPage() {
  const { data = [] } = useQuery({ queryKey: ['notifications'], queryFn: settingsApi.notifications });
  return (
    <div className="page-stack">
      <PageHeader
        title="Notifications"
        description="Configure alert channels for approvals, login expiry, task failure, and runtime events."
        actions={<Button type="primary">Add channel</Button>}
      />
      <Card>
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item extra={<Switch checked={item.status === 'connected'} />}>
              <List.Item.Meta title={item.channel} description={`Events: ${item.events}`} />
            </List.Item>
          )}
        />
      </Card>
      <Card title="Default notification policy">
        <Descriptions column={1}>
          <Descriptions.Item label="approval_required">Send to Approver role immediately</Descriptions.Item>
          <Descriptions.Item label="login_required">Notify Store Owner and Admin</Descriptions.Item>
          <Descriptions.Item label="run_failed">Notify Operator and Admin</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
