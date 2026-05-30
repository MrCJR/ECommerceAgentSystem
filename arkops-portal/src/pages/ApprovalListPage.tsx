import { useQuery } from '@tanstack/react-query';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { approvalsApi } from '../api/approvals';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Approval } from '../types/domain';

export function ApprovalListPage() {
  const { t } = useI18n();
  const { data = [] } = useQuery({ queryKey: ['approvals'], queryFn: approvalsApi.list });
  const columns: ColumnsType<Approval> = [
    { title: t('approvals.approval'), dataIndex: 'title', render: (title, record) => <Link to={`/approvals/${record.id}`}>{title}</Link> },
    { title: t('stores.status'), dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: t('tasks.risk'), dataIndex: 'riskLevel', render: (risk) => <StatusBadge value={risk} /> },
    { title: t('approvals.requested'), dataIndex: 'requestedAt', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') }
  ];
  return (
    <div className="page-stack">
      <PageHeader title={t('approvals.title')} description={t('approvals.description')} />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} />
      </Card>
    </div>
  );
}
