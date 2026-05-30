import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Store } from '../types/domain';

export function StoreListPage() {
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const columns: ColumnsType<Store> = [
    { title: 'Store', dataIndex: 'name', render: (name, record) => <Link to={`/stores/${record.id}`}>{name}</Link> },
    { title: 'Platform', dataIndex: 'platform' },
    { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: 'Runtime', dataIndex: 'runtimeProvider' },
    {
      title: 'Last verified',
      dataIndex: 'lastVerifiedAt',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : 'Not connected')
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Stores"
        description="Manage marketplace store authorization, MuleRun session binding, and login status."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/stores/new')}>
            Add store
          </Button>
        }
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
}
