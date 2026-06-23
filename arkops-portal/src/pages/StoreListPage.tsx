import { ApiOutlined, CustomerServiceOutlined, PlusOutlined, ShoppingCartOutlined, ThunderboltOutlined, WalletOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Store } from '../types/domain';

const serviceIcons: Record<string, JSX.Element> = {
  advertising: <ThunderboltOutlined />,
  customer_service: <CustomerServiceOutlined />,
  logistics: <ShoppingCartOutlined />,
  finance: <WalletOutlined />,
  other: <ApiOutlined />
};

export function StoreListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data = [] } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const columns: ColumnsType<Store> = [
    { title: t('stores.store'), dataIndex: 'name', render: (name, record) => <Link to={`/stores/${record.id}`}>{name}</Link> },
    { title: t('stores.platform'), dataIndex: 'platform' },
    { title: t('stores.authMethod'), dataIndex: 'authMethod', render: (method: Store['authMethod']) => {
      const map: Record<string, string> = { credentials: t('stores.authCredentials'), api_key: t('stores.authApiKey'), oauth: t('stores.authOauth') };
      return <Tag>{map[method] ?? method}</Tag>;
    }},
    { title: t('stores.status'), dataIndex: 'status', render: (status) => <StatusBadge value={status} /> },
    {
      title: t('stores.enabledServices'),
      dataIndex: 'connections',
      render: (connections: Store['connections']) => {
        if (!connections || connections.length === 0) return <Typography.Text type="secondary">-</Typography.Text>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {connections.map((c) => (
              <Tag key={c.id} icon={serviceIcons[c.serviceType] ?? <ApiOutlined />}>
                {c.serviceName}
              </Tag>
            ))}
          </div>
        );
      }
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
