import { useQuery } from '@tanstack/react-query';
import { Card, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { auditLogsApi } from '../api/auditLogs';
import { PageHeader } from '../components/PageHeader';
import type { AuditLog } from '../types/domain';

export function AuditLogsPage() {
  const [keyword, setKeyword] = useState('');
  const { data = [] } = useQuery({ queryKey: ['audit-logs'], queryFn: auditLogsApi.list });
  const filtered = useMemo(
    () =>
      data.filter((item) =>
        `${item.actor} ${item.action} ${item.entity} ${item.summary}`.toLowerCase().includes(keyword.toLowerCase())
      ),
    [data, keyword]
  );
  const columns: ColumnsType<AuditLog> = [
    { title: 'Time', dataIndex: 'at', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') },
    { title: 'Actor', dataIndex: 'actor' },
    { title: 'Action', dataIndex: 'action' },
    { title: 'Entity', dataIndex: 'entity' },
    { title: 'Summary', dataIndex: 'summary' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Audit logs" description="Search execution, approval, store binding, and system events." />
      <Card>
        <Input.Search
          placeholder="Search actor, action, entity, or summary"
          onChange={(event) => setKeyword(event.target.value)}
          style={{ marginBottom: 16, maxWidth: 420 }}
        />
        <Table rowKey="id" columns={columns} dataSource={filtered} />
      </Card>
    </div>
  );
}
