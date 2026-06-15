import { CheckCircleOutlined, CloseCircleOutlined, LineChartOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tag,
  Upload,
  Typography,
  message
} from 'antd';
import type { UploadFile } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { agentsApi } from '../api/agents';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { AgentConfig, AgentType, Task } from '../types/domain';

export function AgentConfigPage() {
  const { t } = useI18n();
  const { agentType } = useParams<{ agentType: AgentType }>();
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', agentType],
    queryFn: () => agentsApi.get(agentType!),
    enabled: Boolean(agentType)
  });

  const { data: stats } = useQuery({
    queryKey: ['agent-stats', agentType],
    queryFn: () => agentsApi.getStats(agentType!),
    enabled: Boolean(agentType)
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['agent-tasks', agentType],
    queryFn: () => agentsApi.getTasks(agentType!),
    enabled: Boolean(agentType)
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: storesApi.list
  });

  const toggleMutation = useMutation({
    mutationFn: () => agentsApi.toggle(agentType!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentType] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (values: { title: string; goal: string; storeId: string }) =>
      agentsApi.createTask(agentType!, {
        title: values.title,
        goal: values.goal,
        storeId: values.storeId,
        images: fileList.map((f) => f.name)
      }),
    onSuccess: () => {
      message.success(t('agent.taskCreated'));
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', agentType] });
      setTaskModalOpen(false);
      taskForm.resetFields();
      setFileList([]);
    }
  });

  const needsImages = agentType === 'product_launch';

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  if (!agent) return <Typography.Text type="danger">{t('agent.notFound')}</Typography.Text>;

  return (
    <div className="page-stack">
      <PageHeader
        title={agent.displayName}
        description={agent.description}
        actions={
          <Space>
            <span>{t('agent.enable')}</span>
            <Switch checked={agent.enabled} onChange={() => toggleMutation.mutate()} />
          </Space>
        }
      />

      {/* 运行统计 */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card><Statistic title={t('agent.totalRuns')} value={stats.totalRuns} prefix={<LineChartOutlined />} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title={t('agent.successRate')} value={`${stats.successRate}%`} valueStyle={{ color: stats.successRate >= 90 ? '#16a34a' : '#ea580c' }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title={t('agent.succeededRuns')} value={Math.round(stats.totalRuns * stats.successRate / 100)} valueStyle={{ color: '#16a34a' }} prefix={<CheckCircleOutlined />} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title={t('agent.failedRuns')} value={stats.totalRuns - Math.round(stats.totalRuns * stats.successRate / 100)} valueStyle={{ color: '#dc2626' }} prefix={<CloseCircleOutlined />} /></Card>
          </Col>
        </Row>
      )}

      {/* 运行说明 */}
      <Card title={t('agent.whatItDoes')} style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label={t('agent.function')}>{agent.description}</Descriptions.Item>
          <Descriptions.Item label={t('agent.triggerDesc')}>
            <Tag>{agent.triggerMode === 'scheduled' ? t('agent.autoRun') : agent.triggerMode === 'event' ? t('agent.eventRun') : t('agent.manualRun')}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('agent.riskDesc')}>
            <StatusBadge value={agent.riskLevel} /> <Typography.Text type="secondary">{agent.riskLevel === 'high' ? t('agent.riskHighDesc') : agent.riskLevel === 'medium' ? t('agent.riskMediumDesc') : t('agent.riskLowDesc')}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('agent.approval')}>
            {agent.approvalStrategy.requireApproval
              ? <Tag color="orange">{t('agent.needApproval')}</Tag>
              : <Tag color="green">{t('agent.noApproval')}</Tag>}
          </Descriptions.Item>
          {stats && stats.failureReasons.length > 0 && (
            <Descriptions.Item label={t('agent.failureReasons')}>
              {stats.failureReasons.map((item: { reason: string; count: number }) => (
                <Tag key={item.reason}>{item.reason} ×{item.count}</Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 任务历史 */}
      <Card
        title={<><UnorderedListOutlined /> {t('agent.taskHistory')} ({tasks.length})</>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
            {t('agent.newTask')}
          </Button>
        }
      >
        {tasks.length === 0 ? (
          <Typography.Text type="secondary">{t('agent.noTasks')}</Typography.Text>
        ) : (
          <Table
            rowKey="id"
            dataSource={tasks}
            pagination={{ pageSize: 10, size: 'small' }}
            size="small"
            columns={[
              { title: t('entity.task'), dataIndex: 'title', render: (title: string) => <Typography.Text strong>{title}</Typography.Text> },
              { title: t('agent.taskGoal'), dataIndex: 'goal', render: (goal: string) => <Typography.Text type="secondary">{goal}</Typography.Text> },
              { title: t('stores.status'), dataIndex: 'status', width: 120, render: (status: string) => <StatusBadge value={status as Task['status']} /> },
              { title: t('stores.createdAt'), dataIndex: 'createdAt', width: 140, render: (v: string) => new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
            ]}
          />
        )}
      </Card>

      {/* 新建任务弹窗 */}
      <Modal
        title={t('agent.newTask')}
        open={taskModalOpen}
        onOk={() => taskForm.submit()}
        onCancel={() => { setTaskModalOpen(false); taskForm.resetFields(); setFileList([]); }}
        confirmLoading={createTaskMutation.isPending}
        width={520}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={(values) => createTaskMutation.mutate(values)}
          initialValues={{ storeId: stores[0]?.id }}
        >
          <Form.Item label={t('entity.task')} name="title" rules={[{ required: true }]}>
            <Input placeholder={t('agent.taskTitlePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('agent.taskGoal')} name="goal" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder={t('agent.taskGoalPlaceholder')} />
          </Form.Item>
          <Form.Item label={t('entity.storeName')} name="storeId" rules={[{ required: true }]}>
            <Select
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          {needsImages && (
            <Form.Item label={t('agent.uploadImages')}>
              <Upload
                multiple
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: newList }) => setFileList(newList)}
                beforeUpload={() => false}
                maxCount={10}
              >
                {fileList.length < 10 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>{t('agent.upload')}</div></div>}
              </Upload>
              <Typography.Text type="secondary">{t('agent.uploadHint')}</Typography.Text>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
