import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, Form, Input, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores';
import { tasksApi } from '../api/tasks';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';

export function CreateTaskPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: stores = [] } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });
  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: (task) => navigate(`/tasks/${task.id}`)
  });

  return (
    <div className="page-stack">
      <PageHeader
        title={t('tasks.createTitle')}
        description={t('tasks.createDescription')}
      />
      <Card>
        <Form
          layout="vertical"
          onFinish={(values) => createTask.mutate(values)}
          initialValues={{ agentType: 'ads_optimizer' }}
        >
          <Form.Item label={t('stores.store')} name="storeId" rules={[{ required: true }]}>
            <Select
              options={stores.map((store) => ({
                value: store.id,
                label: `${store.name}（${t(`status.${store.status}`)}）`
              }))}
            />
          </Form.Item>
          <Form.Item label={t('tasks.agentType')} name="agentType" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'login_bootstrap', label: t('agent.login_bootstrap') },
                { value: 'ads_optimizer', label: t('agent.ads_optimizer') },
                { value: 'product_launch', label: t('agent.product_launch') },
                { value: 'crm_retention', label: t('agent.crm_retention') },
                { value: 'finance_audit', label: t('agent.finance_audit') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('tasks.goal')} name="goal" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder={t('task.placeholder')} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createTask.isPending}>
            {t('tasks.submit')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
