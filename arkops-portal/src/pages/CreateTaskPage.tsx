import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Form, Input, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { tasksApi } from '../api/tasks';
import { PageHeader } from '../components/PageHeader';

export function CreateTaskPage() {
  const navigate = useNavigate();
  const { data: stores = [] } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });
  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (task) => navigate(`/tasks/${task.id}`)
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Agent task"
        description="Create a controlled Agent run for a connected store. Data is currently mocked for MVP review."
      />
      <Card>
        <Form
          layout="vertical"
          onFinish={(values) => createTask.mutate(values)}
          initialValues={{ agentType: 'ads_optimizer' }}
        >
          <Form.Item label="Store" name="storeId" rules={[{ required: true }]}>
            <Select options={stores.map((store) => ({ value: store.id, label: `${store.name} (${store.status})` }))} />
          </Form.Item>
          <Form.Item label="Agent type" name="agentType" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'login_bootstrap', label: 'Login Bootstrap Agent' },
                { value: 'ads_optimizer', label: 'Advertising Agent' },
                { value: 'product_launch', label: 'Product Launch Agent' },
                { value: 'crm_retention', label: 'CRM Retention Agent' },
                { value: 'finance_audit', label: 'Finance Audit Agent' }
              ]}
            />
          </Form.Item>
          <Form.Item label="Goal" name="goal" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="Analyze low-ROI campaigns and propose budget changes." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createTask.isPending}>
            Submit task
          </Button>
        </Form>
      </Card>
    </div>
  );
}
