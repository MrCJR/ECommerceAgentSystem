import { FileSearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Card, Descriptions, Space, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function TaskDetailPage() {
  const { taskId } = useParams();
  const { data: task } = useQuery({ queryKey: ['task', taskId], queryFn: () => tasksApi.get(taskId!) });

  if (!task) {
    return <EmptyState description="Task not found" />;
  }

  return (
    <div className="page-stack">
      <PageHeader title={task.title} description={task.goal} />
      <Card>
        <Descriptions column={4}>
          <Descriptions.Item label="Status">
            <StatusBadge value={task.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Risk">
            <StatusBadge value={task.riskLevel} />
          </Descriptions.Item>
          <Descriptions.Item label="Agent">{task.agentType}</Descriptions.Item>
          <Descriptions.Item label="Store">{task.storeId}</Descriptions.Item>
        </Descriptions>
      </Card>
      {task.status === 'waiting_approval' ? (
        <Alert
          type="warning"
          showIcon
          message="Human approval is required"
          description="This task is paused until an approver reviews the proposed action."
        />
      ) : null}
      <Card title="Run timeline">
        <Timeline
          items={task.timeline.map((event) => ({
            color: event.type.includes('failed') ? 'red' : event.type.includes('approval') ? 'orange' : 'blue',
            children: (
              <Space direction="vertical" size={3}>
                <Typography.Text strong>{event.title}</Typography.Text>
                <Typography.Text type="secondary">{event.summary}</Typography.Text>
                <Typography.Text type="secondary">{dayjs(event.at).format('YYYY-MM-DD HH:mm')}</Typography.Text>
                {event.artifactUrl ? (
                  <Typography.Text copyable>
                    <FileSearchOutlined /> {event.artifactUrl}
                  </Typography.Text>
                ) : null}
              </Space>
            )
          }))}
        />
      </Card>
    </div>
  );
}
