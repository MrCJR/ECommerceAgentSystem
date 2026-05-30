import { useQuery } from '@tanstack/react-query';
import { Card, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { auditLogsApi } from '../api/auditLogs';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import type { AuditLog } from '../types/domain';

export function AuditLogsPage() {
  const { t } = useI18n();
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
    { title: t('audit.time'), dataIndex: 'at', render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm') },
    { title: t('audit.actor'), dataIndex: 'actor' },
    { title: t('audit.action'), dataIndex: 'action' },
    { title: t('audit.entity'), dataIndex: 'entity' },
    { title: t('audit.summary'), dataIndex: 'summary' }
  ];

  return (
    <div className="page-stack">
      <PageHeader title={t('audit.title')} description={t('audit.description')} />
      <Card>
        <Input.Search
          placeholder={t('audit.search')}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ marginBottom: 16, maxWidth: 420 }}
        />
        <Table rowKey="id" columns={columns} dataSource={filtered} />
      </Card>
    </div>
  );
}
