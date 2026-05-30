import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Task } from '../types/domain';

export function TaskListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list });

  const columns: ColumnsType<Task> = [
    { title: t('entity.task'), dataIndex: 'title', render: (title, record) => <Link to={`/tasks/${record.id}`}>{title}</Link> },
    { title: t('tasks.agent'), dataIndex: 'agentType', render: (agentType) => t(`agent.${agentType}`) },
    { title: t('stores.status'), dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: t('tasks.risk'), dataIndex: 'riskLevel', render: (risk) => <StatusBadge value={risk} /> },
    { title: t('tasks.updated'), dataIndex: 'updatedAt', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={t('tasks.title')}
        description={t('tasks.description')}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')}>
            {t('tasks.create')}
          </Button>
        }
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} />
      </Card>
    </div>
  );
}
