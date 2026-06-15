import { DeleteOutlined, KeyOutlined, LineChartOutlined, PlusOutlined, RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Form, Input, Modal, Progress, Row, Select, Statistic, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { modelsApi } from '../api/models';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import type { AgentModelBinding, ModelInfo, ModelUsageStats } from '../types/domain';

export function ModelListPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  const { data: platformModels = [] } = useQuery({ queryKey: ['models-platform'], queryFn: modelsApi.listPlatform });
  const { data: customModels = [] } = useQuery({ queryKey: ['models-custom'], queryFn: modelsApi.listCustom });
  const { data: bindings = [] } = useQuery({ queryKey: ['model-bindings'], queryFn: modelsApi.getBindings });
  const { data: usageStats = [] } = useQuery({ queryKey: ['modelUsage'], queryFn: modelsApi.getUsageStats });

  const addMutation = useMutation({
    mutationFn: modelsApi.addCustom,
    onSuccess: () => {
      message.success(t('model.added'));
      queryClient.invalidateQueries({ queryKey: ['models-custom'] });
      setAddModalOpen(false);
      addForm.resetFields();
    }
  });

  const removeMutation = useMutation({
    mutationFn: modelsApi.removeCustom,
    onSuccess: () => {
      message.success(t('model.removed'));
      queryClient.invalidateQueries({ queryKey: ['models-custom'] });
    }
  });

  const bindMutation = useMutation({
    mutationFn: (params: { agentType: string; modelId: string; modelName: string }) =>
      modelsApi.updateBinding(params.agentType, params.modelId, params.modelName),
    onSuccess: () => {
      message.success(t('model.bindingSaved'));
      queryClient.invalidateQueries({ queryKey: ['model-bindings'] });
    }
  });

  const activePlatform = platformModels.filter((m) => m.active);
  const activeCustom = customModels.filter((m) => m.active);
  const allActive = [...activePlatform, ...activeCustom];
  const totalCalls = usageStats.reduce((sum, s) => sum + s.totalCalls, 0);

  // 合并平台 + 自定义模型为下拉选项
  const allModelOptions = [
    ...activePlatform.map((m) => ({ value: m.id, label: m.name })),
    ...activeCustom.map((m) => ({ value: m.id, label: `${m.name}（自有）` }))
  ];

  const agentColumns: ColumnsType<AgentModelBinding> = [
    {
      title: t('agent.name'),
      dataIndex: 'agentDisplayName',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>
    },
    {
      title: t('model.modelName'),
      width: 280,
      render: (_: unknown, record: AgentModelBinding) => (
        <Select
          value={record.boundModelId}
          style={{ width: '100%' }}
          options={allModelOptions}
          onChange={(modelId: string) => {
            const opt = allModelOptions.find((o) => o.value === modelId);
            if (opt) bindMutation.mutate({ agentType: record.agentType, modelId, modelName: opt.label });
          }}
        />
      )
    }
  ];

  const customColumns: ColumnsType<ModelInfo> = [
    {
      title: t('model.modelName'),
      dataIndex: 'name',
      render: (name: string, record: ModelInfo) => (
        <div>
          <Typography.Text strong>{name}</Typography.Text>
          {record.apiKey && <Tag style={{ marginLeft: 8 }}>API: {record.apiKey}</Tag>}
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Typography.Text>
        </div>
      )
    },
    {
      title: t('common.actions'),
      width: 60,
      key: 'actions',
      render: (_: unknown, record: ModelInfo) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeMutation.mutate(record.id)} />
      )
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader title={t('model.title')} description={t('model.descriptionSimple')} />
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card><Statistic title={t('model.totalModels')} value={allActive.length} prefix={<ThunderboltOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card><Statistic title={t('model.totalCalls')} value={totalCalls} prefix={<LineChartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card><Statistic title={t('model.totalTokens')} value={usageStats.reduce((s, u) => s + u.totalTokens, 0)} prefix="T" /></Card>
        </Col>
      </Row>

      {/* Agent 模型分配（含平台模型选择） */}
      <Card
        title={<><RobotOutlined /> {t('model.agentBinding')}</>}
        extra={<Typography.Text type="secondary">{t('model.agentBindingNote')}</Typography.Text>}
        style={{ marginBottom: 24 }}
      >
        <Table rowKey="agentType" columns={agentColumns} dataSource={bindings} pagination={false} showHeader={false} />
      </Card>

      {/* 我的模型 */}
      <Card
        title={<><KeyOutlined /> {t('model.myModels')}</>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>{t('model.addCustom')}</Button>}
        style={{ marginBottom: 24 }}
      >
        {customModels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            <Typography.Paragraph type="secondary">{t('model.noCustom')}</Typography.Paragraph>
            <Button icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>{t('model.addCustom')}</Button>
          </div>
        ) : (
          <Table rowKey="id" columns={customColumns} dataSource={customModels} pagination={false} showHeader={false} />
        )}
      </Card>

      {/* 使用统计 */}
      <Typography.Title level={5} style={{ marginBottom: 16 }}><LineChartOutlined /> {t('model.usageStats')}</Typography.Title>
      {usageStats.length === 0 ? (
        <Card><Typography.Text type="secondary">{t('model.noStats')}</Typography.Text></Card>
      ) : (
        usageStats.map((stat) => {
          const maxCalls = Math.max(...usageStats.map((s) => s.totalCalls), 1);
          return (
            <Card key={stat.modelId} size="small" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography.Text strong>{stat.modelName}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {t('model.calls')}: {stat.totalCalls.toLocaleString()} | Tokens: {stat.totalTokens.toLocaleString()}
                  </Typography.Text>
                </div>
                <Tag color="blue">{stat.totalCalls} 次</Tag>
              </div>
              <Progress percent={Math.round((stat.totalCalls / maxCalls) * 100)} size="small" strokeColor="#2563eb" />
            </Card>
          );
        })
      )}

      {/* 添加模型弹窗 */}
      <Modal
        title={t('model.addCustom')}
        open={addModalOpen}
        onOk={() => addForm.submit()}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        confirmLoading={addMutation.isPending}
      >
        <Form form={addForm} layout="vertical" onFinish={(values) => addMutation.mutate(values)} initialValues={{ modelType: 'gpt-4o' }}>
          <Form.Item label={t('model.modelName')} name="modelType" rules={[{ required: true }]}>
            <Select
              showSearch
              options={[
                { value: 'gpt-4o', label: 'GPT-4o' }, { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }, { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                { value: 'claude-sonnet-4', label: 'Claude Sonnet 4' }, { value: 'claude-opus-4', label: 'Claude Opus 4' },
                { value: 'deepseek-v3', label: 'DeepSeek-V3' }, { value: 'deepseek-r1', label: 'DeepSeek-R1' },
                { value: 'qwen-max', label: '通义千问 Max' }, { value: 'glm-4', label: '智谱 GLM-4' },
                { value: 'moonshot-v1', label: 'Moonshot v1' }, { value: 'other', label: t('model.otherModel') }
              ]}
            />
          </Form.Item>
          <Form.Item label={t('model.description')} name="description">
            <Input placeholder={t('model.descriptionPlaceholder')} />
          </Form.Item>
          <Form.Item label="API Key" name="apiKey" rules={[{ required: true }]}>
            <Input.Password placeholder="sk-..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
