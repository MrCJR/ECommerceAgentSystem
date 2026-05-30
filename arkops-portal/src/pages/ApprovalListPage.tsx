import { useQuery } from '@tanstack/react-query';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { approvalsApi } from '../api/approvals';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Approval } from '../types/domain';

export function ApprovalListPage() {
  const { data = [] } = useQuery({ queryKey: ['approvals'], queryFn: approvalsApi.list });
  const columns: ColumnsType<Approval> = [
    { title: 'Approval', dataIndex: 'title', render: (title, record) => <Link to={`/approvals/${record.id}`}>{title}</Link> },
    { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: 'Risk', dataIndex: 'riskLevel', render: (risk) => <StatusBadge value={risk} /> },
    { title: 'Requested', dataIndex: 'requestedAt', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') }
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Approvals" description="Review high-risk Agent actions before execution continues." />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} />
      </Card>
    </div>
  );
}
