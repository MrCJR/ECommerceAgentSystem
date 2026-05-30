import { LinkOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Form, Input, Select, Space, Table, Typography, message } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';

export function StoreDetailPage({ mode }: { mode?: 'new' }) {
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
      message.success('connectToken generated');
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
        <PageHeader title="Add store" description="Create a store record before MuleRun session binding." />
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => createStore.mutate(values)}
            initialValues={{ platform: 'tiktok_shop' }}
          >
            <Form.Item label="Store name" name="name" rules={[{ required: true }]}>
              <Input placeholder="TikTok Shop US Flagship" />
            </Form.Item>
            <Form.Item label="Platform" name="platform" rules={[{ required: true }]}>
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
              Create store
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={store?.name ?? 'Store detail'}
        description="Store authorization, MuleRun browser profile binding, and recent Agent activity."
        actions={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => storeId && tokenMutation.mutate(storeId)}>
              Generate connectToken
            </Button>
            <Button
              icon={<LinkOutlined />}
              onClick={() => storeId && statusMutation.mutate({ id: storeId, status: 'login_required' })}
            >
              Mark re-auth
            </Button>
            <Button danger icon={<StopOutlined />} onClick={() => storeId && statusMutation.mutate({ id: storeId, status: 'revoked' })}>
              Revoke
            </Button>
          </Space>
        }
      />
      <div className="two-col-grid">
        <Card title="Authorization">
          <Descriptions column={1}>
            <Descriptions.Item label="Platform">{store?.platform}</Descriptions.Item>
            <Descriptions.Item label="Status">{store ? <StatusBadge value={store.status} /> : null}</Descriptions.Item>
            <Descriptions.Item label="Runtime provider">{store?.runtimeProvider}</Descriptions.Item>
            <Descriptions.Item label="Runtime session">{store?.runtimeSessionId ?? 'Not bound yet'}</Descriptions.Item>
          </Descriptions>
          {tokenMutation.data ? (
            <Card size="small" style={{ marginTop: 16, background: '#f8fafc' }}>
              <Typography.Text strong>connectToken</Typography.Text>
              <Typography.Paragraph copyable style={{ marginTop: 8 }}>
                {tokenMutation.data.connectToken}
              </Typography.Paragraph>
              <Typography.Text type="secondary">Expires in {tokenMutation.data.expiresInMinutes} minutes.</Typography.Text>
            </Card>
          ) : null}
        </Card>
        <Card title="Beta binding instructions">
          <ol>
            <li>Generate a connectToken from ArkOps.</li>
            <li>Open MuleRun Login Bootstrap Agent manually.</li>
            <li>Paste the token into MuleRun.</li>
            <li>Complete marketplace login and human verification.</li>
            <li>MuleRun calls ArkOps to bind runtimeSessionId.</li>
          </ol>
        </Card>
      </div>
      <Card title="Recent tasks">
        <Table
          rowKey="id"
          dataSource={tasks}
          pagination={false}
          columns={[
            { title: 'Task', dataIndex: 'title', render: (title, record) => <Link to={`/tasks/${record.id}`}>{title}</Link> },
            { title: 'Agent', dataIndex: 'agentType' },
            { title: 'Status', dataIndex: 'status', render: (status) => <StatusBadge value={status} /> }
          ]}
        />
      </Card>
    </div>
  );
}
