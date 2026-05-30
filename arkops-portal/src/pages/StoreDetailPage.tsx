import { LinkOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Form, Input, Select, Space, Table, Typography, message } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function StoreDetailPage({ mode }: { mode?: 'new' }) {
  const { t } = useI18n();
  const { storeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storesApi.get(storeId!),
    enabled: Boolean(storeId) && mode !== 'new'
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['store-tasks', storeId],
    queryFn: () => storesApi.recentTasks(storeId!),
    enabled: Boolean(storeId) && mode !== 'new'
  });
  const createStore = useMutation({
    mutationFn: storesApi.create,
    onSuccess: (created) => navigate(`/stores/${created.id}`)
  });
  const tokenMutation = useMutation({
    mutationFn: storesApi.createConnectToken,
    onSuccess: (result) => {
      message.success(t('stores.tokenGenerated'));
      navigator.clipboard?.writeText(result.connectToken);
    }
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'login_required' | 'revoked' }) =>
      storesApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store', storeId] })
  });

  if (mode === 'new') {
    return (
      <div className="page-stack">
        <PageHeader title={t('stores.addTitle')} description={t('stores.addDescription')} />
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => createStore.mutate(values)}
            initialValues={{ platform: 'tiktok_shop' }}
          >
            <Form.Item label={t('stores.name')} name="name" rules={[{ required: true }]}>
              <Input placeholder={t('stores.namePlaceholder')} />
            </Form.Item>
            <Form.Item label={t('stores.platform')} name="platform" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'tiktok_shop', label: 'TikTok Shop' },
                  { value: 'amazon', label: 'Amazon' },
                  { value: 'shopify', label: 'Shopify' },
                  { value: 'shopee', label: 'Shopee' }
                ]}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={createStore.isPending}>
              {t('stores.create')}
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={store?.name ?? t('stores.detailTitle')}
        description={t('stores.detailDescription')}
        actions={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => storeId && tokenMutation.mutate(storeId)}>
              {t('stores.generateToken')}
            </Button>
            <Button
              icon={<LinkOutlined />}
              onClick={() => storeId && statusMutation.mutate({ id: storeId, status: 'login_required' })}
            >
              {t('stores.markReauth')}
            </Button>
            <Button danger icon={<StopOutlined />} onClick={() => storeId && statusMutation.mutate({ id: storeId, status: 'revoked' })}>
              {t('stores.revoke')}
            </Button>
          </Space>
        }
      />
      <div className="two-col-grid">
        <Card title={t('stores.authorization')}>
          <Descriptions column={1}>
            <Descriptions.Item label={t('stores.platform')}>{store?.platform}</Descriptions.Item>
            <Descriptions.Item label={t('stores.status')}>{store ? <StatusBadge value={store.status} /> : null}</Descriptions.Item>
            <Descriptions.Item label={t('stores.runtimeProvider')}>{store?.runtimeProvider}</Descriptions.Item>
            <Descriptions.Item label={t('stores.runtimeSession')}>{store?.runtimeSessionId ?? t('stores.notBound')}</Descriptions.Item>
          </Descriptions>
          {tokenMutation.data ? (
            <Card size="small" style={{ marginTop: 16, background: '#f8fafc' }}>
              <Typography.Text strong>connectToken</Typography.Text>
              <Typography.Paragraph copyable style={{ marginTop: 8 }}>
                {tokenMutation.data.connectToken}
              </Typography.Paragraph>
              <Typography.Text type="secondary">
                {t('stores.expires', { minutes: tokenMutation.data.expiresInMinutes })}
              </Typography.Text>
            </Card>
          ) : null}
        </Card>
        <Card title={t('stores.instructions')}>
          <ol>
            <li>{t('stores.step1')}</li>
            <li>{t('stores.step2')}</li>
            <li>{t('stores.step3')}</li>
            <li>{t('stores.step4')}</li>
            <li>{t('stores.step5')}</li>
          </ol>
        </Card>
      </div>
      <Card title={t('stores.recentTasks')}>
        <Table
          rowKey="id"
          dataSource={tasks}
          pagination={false}
          columns={[
            { title: t('entity.task'), dataIndex: 'title', render: (title, record) => <Link to={`/tasks/${record.id}`}>{title}</Link> },
            { title: t('tasks.agent'), dataIndex: 'agentType', render: (agentType) => t(`agent.${agentType}`) },
            { title: t('stores.status'), dataIndex: 'status', render: (status) => <StatusBadge value={status} /> }
          ]}
        />
      </Card>
    </div>
  );
}
