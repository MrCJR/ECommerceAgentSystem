import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Task } from '../types/domain';

export function TaskListPage() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list });

  const columns: ColumnsType<Task> = [
    { title: 'Task', dataIndex: 'title', render: (title, record) => <Link to={`/tasks/${record.id}`}>{title}</Link> },
    { title: 'Agent', dataIndex: 'agentType' },
    { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: 'Risk', dataIndex: 'riskLevel', render: (risk) => <StatusBadge value={risk} /> },
    { title: 'Updated', dataIndex: 'updatedAt', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Agent tasks"
        description="Create and monitor Agent execution across stores and runtime providers."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')}>
            Create task
          </Button>
        }
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} />
      </Card>
    </div>
  );
}
