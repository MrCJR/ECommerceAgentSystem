import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Store } from '../types/domain';

export function StoreListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const columns: ColumnsType<Store> = [
    { title: t('stores.store'), dataIndex: 'name', render: (name, record) => <Link to={`/stores/${record.id}`}>{name}</Link> },
    { title: t('stores.platform'), dataIndex: 'platform' },
    { title: t('stores.status'), dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    { title: t('stores.runtime'), dataIndex: 'runtimeProvider' },
    {
      title: t('stores.lastVerified'),
      dataIndex: 'lastVerifiedAt',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : t('stores.notConnected'))
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={t('stores.title')}
        description={t('stores.description')}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/stores/new')}>
            {t('stores.add')}
          </Button>
        }
      />
      <Card>
        <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
}
