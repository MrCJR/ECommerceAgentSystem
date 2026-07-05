import { CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, InfoCircleOutlined, KeyOutlined, LineChartOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined, StopOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
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
import { useNavigate, useParams } from 'react-router-dom';
import { agentsApi } from '../api/agents';
import { storesApi } from '../api/stores';
import { useI18n } from '../app/i18n';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { AgentBuiltinTasksSection } from './AgentBuiltinTasksSection';
import { AgentStrategyConfigSection } from './AgentStrategyConfigSection';
import { AgentWorkflowModals } from './AgentWorkflowModals';
import { ProductDraftPreview } from './ProductDraftPreview';
import { TaskTimelinePreview } from './TaskTimelinePreview';
import type { AgentConfig, AgentType, AllMallId, Task, TaskStatus } from '../types/domain';
import {
  productDrafts,
  recognitionVariants,
  type ProductRecognitionResult
} from './agentConfigMockData';

export function AgentConfigPage() {
  const { t } = useI18n();
  const { agentType } = useParams<{ agentType: AgentType }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [productStep, setProductStep] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<ProductRecognitionResult | null>(null);

  const [creativeModalOpen, setCreativeModalOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [crmModalOpen, setCrmModalOpen] = useState(false);
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [adDashboardOpen, setAdDashboardOpen] = useState(false);

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', agentType],
    queryFn: () => agentsApi.get(agentType!),
    enabled: Boolean(agentType)
  });

  const { data: allAgents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list
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
    },
    onError: (error: Error) => {
      message.error(error.message);
    }
  });

  const enableAllDepsMutation = useMutation({
    mutationFn: async () => {
      for (const depType of depsMissing) {
        await agentsApi.toggle(depType);
      }
    },
    onSuccess: () => {
      message.success(t('agent.depsEnabled') || 'All dependencies enabled');
      queryClient.invalidateQueries({ queryKey: ['agent', agentType] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error: Error) => {
      message.error(error.message);
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (values: { title?: string; goal?: string; storeId: AllMallId }) =>
      agentsApi.createTask(agentType!, {
        title: values.title || values.goal || '',
        goal: values.goal || '',
        storeId: values.storeId,
        images: fileList.map((f) => f.name)
      }),
    onSuccess: () => {
      message.success(t('agent.taskCreated'));
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', agentType] });
      setTaskModalOpen(false);
      taskForm.resetFields();
      setFileList([]);
      setProductStep(0);
      setRecognitionResult(null);
    }
  });

  const handleStartRecognize = () => {
    if (fileList.length === 0) {
      message.warning(t('agent.uploadHint'));
      return;
    }
    setRecognizing(true);
    const idx = Math.floor(Math.random() * recognitionVariants.length);
    setTimeout(() => {
      setRecognizing(false);
      setRecognitionResult(recognitionVariants[idx]);
      setProductStep(1);
      setTaskModalOpen(false);
    }, 1500);
  };

  const cancelTaskMutation = useMutation({
    mutationFn: (taskId: AllMallId) => agentsApi.cancelTask(taskId),
    onSuccess: () => {
      message.success(t('agent.taskCancelled'));
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', agentType] });
    }
  });

  const needsImages = agentType === 'product_launch';
  const isLoginBootstrap = agentType === 'login_bootstrap';
  const isCompetitorIntel = agentType === 'competitor_intel';
  const isProductLaunch = agentType === 'product_launch';
  const isAdsOptimizer = agentType === 'ads_optimizer';
  const isPricingStrategy = agentType === 'pricing_strategy';
  const isCrmRetention = agentType === 'crm_retention';
  const isReviewManager = agentType === 'review_manager';
  const isCustomerService = agentType === 'customer_service';
  const isAfterSales = agentType === 'after_sales';
  const isCreativeFactory = agentType === 'creative_factory';
  const isInventoryAlert = agentType === 'inventory_alert';
  const isRiskControl = agentType === 'risk_control';
  const isFinanceAudit = agentType === 'finance_audit';
  const isPromotionCampaign = agentType === 'promotion_campaign';
  const isLiveStreamOps = agentType === 'live_stream_ops';
  const hasBuiltinTasks = isLoginBootstrap || isCompetitorIntel || isProductLaunch || isAdsOptimizer || isPricingStrategy || isCrmRetention || isReviewManager || isCustomerService || isAfterSales || isCreativeFactory || isInventoryAlert || isRiskControl || isFinanceAudit;

  const activeStatuses: TaskStatus[] = ['draft', 'queued', 'running', 'waiting_approval'];
  const logStatuses: TaskStatus[] = ['succeeded', 'failed', 'cancelled'];
  const activeTasks = tasks.filter((t) => activeStatuses.includes(t.status));
  const logTasks = tasks.filter((t) => logStatuses.includes(t.status));

  /* ---- 评价管理：差评监控 ---- */
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  if (!agent) return <Typography.Text type="danger">{t('agent.notFound')}</Typography.Text>;

  const depsMissing = agent.dependsOn.filter((d) => !allAgents.find((a) => a.agentType === d)?.enabled);
  const switchDisabled = agent.required || depsMissing.length > 0;
  const riskControlOn = allAgents.find((a) => a.agentType === 'risk_control')?.enabled === true;
  const isGuarded = riskControlOn && agent.agentType !== 'risk_control' && agent.agentType !== 'finance_audit';


  return (
    <div className="page-stack">
      <PageHeader
        title={
          <span>
            {agent.displayName}
            {isGuarded && <Tag icon={<SafetyOutlined />} color="green" style={{ marginLeft: 8, fontSize: 11 }}>{t('agent.guarded')}</Tag>}
          </span>
        }
        description={agent.description}
        actions={
          <Space>
            <span>{agent.enabled ? t('agent.enable') : t('agent.disable')}</span>
            <Switch checked={agent.enabled} disabled={switchDisabled} onChange={() => toggleMutation.mutate()} />
            {depsMissing.length > 0 && (
              <Typography.Text type="danger" style={{ fontSize: 11, display: 'block' }}>
                {t('agent.dependsOn')}: {depsMissing.map((d) => t(`agent.${d}`)).join(', ')}
                <Button
                  size="small"
                  type="link"
                  danger
                  loading={enableAllDepsMutation.isPending}
                  onClick={() => enableAllDepsMutation.mutate()}
                  style={{ padding: '0 4px', fontSize: 11, height: 'auto' }}
                >
                  ({t('agent.enableAll')})
                </Button>
              </Typography.Text>
            )}
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
      {!isLoginBootstrap && (
        <Card title={<><InfoCircleOutlined /> {t('agent.operationGuide')}</>} style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="触发方式">
              {agent.triggerMode === 'scheduled' ? `定时（${agent.cronExpression}）`
                : agent.triggerMode === 'event' ? `事件驱动（${agent.eventTrigger}）`
                : '手动触发'}
            </Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <Tag color={agent.riskLevel === 'high' ? 'red' : agent.riskLevel === 'medium' ? 'orange' : 'green'}>
                {agent.riskLevel === 'high' ? '高风险' : agent.riskLevel === 'medium' ? '中风险' : '低风险'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="依赖Agent">
              {agent.dependsOn.length > 0
                ? agent.dependsOn.map(d => t(`agent.${d}`)).join(' · ')
                : '无依赖'}
            </Descriptions.Item>
            <Descriptions.Item label="服务对象">
              {agent.servesFor.length > 0
                ? agent.servesFor.map(s => t(`agent.${s}`)).join(' · ')
                : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="审批要求">
              {agent.approvalStrategy?.requireApproval
                ? `需要审批（${agent.approvalStrategy.approverRole}）${agent.approvalStrategy.requireSecondApproval ? ' · 需双人审批' : ''}`
                : '无需审批'}
            </Descriptions.Item>
            <Descriptions.Item label="绑定模型">
              {agent.modelBinding ? `${agent.modelBinding.provider} / ${agent.modelBinding.model}` : '未绑定'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <AgentBuiltinTasksSection
        agentType={agent.agentType}
        onOpenAdDashboard={() => setAdDashboardOpen(true)}
        onOpenCrmModal={() => setCrmModalOpen(true)}
        onOpenReviewModal={() => setReviewModalOpen(true)}
        onOpenCsModal={() => setCsModalOpen(true)}
        onOpenCreativeModal={() => setCreativeModalOpen(true)}
        onOpenRiskModal={() => setRiskModalOpen(true)}
        onOpenLiveModal={() => setLiveModalOpen(true)}
      />

      <AgentStrategyConfigSection agent={agent} />

      {/* 任务日志区 */}
      {!isLoginBootstrap && (
        <Typography.Title level={5} style={{ marginTop: recognitionResult ? 0 : 24, marginBottom: 12 }}>
          <UnorderedListOutlined style={{ marginRight: 8, color: '#64748b' }} />
          {t('agent.logSection')}
        </Typography.Title>
      )}

      {/* 运行中任务 */}
      {!isLoginBootstrap && activeTasks.length > 0 && (
        <Card
          title={<><UnorderedListOutlined /> {t('agent.activeTasks')} ({activeTasks.length})</>}
          extra={
            isProductLaunch ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
                {t('agent.uploadProduct')}
              </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
                {t('agent.newTask')}
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            rowKey="id"
            dataSource={activeTasks}
            pagination={false}
            size="small"
            expandable={{
              expandedRowRender: (record: Task) => {
                const draft = productDrafts[record.id];
                if (!draft) {
                  return <TaskTimelinePreview task={record} emptyText={t('common.empty')} />;
                }
                return (
                  <ProductDraftPreview
                    draft={draft}
                    task={record}
                    onRegenerate={(taskId) => {
                      cancelTaskMutation.mutate(taskId);
                      setTaskModalOpen(true);
                    }}
                    onCancel={(taskId) => cancelTaskMutation.mutate(taskId)}
                  />
                );
              },
              rowExpandable: () => true
            }}
            columns={[
              {
                title: t('entity.task'), dataIndex: 'title',
                render: (title: string) => (
                  <Typography.Text strong style={{ cursor: 'pointer', color: '#2563eb' }}>{title}</Typography.Text>
                )
              },
              { title: t('stores.status'), dataIndex: 'status', width: 120, render: (status: TaskStatus) => <StatusBadge value={status} /> },
              { title: t('stores.createdAt'), dataIndex: 'createdAt', width: 140, render: (v: string) => new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              {
                title: t('common.actions'), width: isProductLaunch ? 160 : 80,
                render: (_: unknown, record: Task) => (
                  <Space size="small">
                    {isProductLaunch && (record.status === 'queued' || record.status === 'draft') && (
                      <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          cancelTaskMutation.mutate(record.id);
                          setTaskModalOpen(true);
                        }}
                      >
                        {t('agent.regenerate')}
                      </Button>
                    )}
                    <Button
                      size="small"
                      danger
                      icon={<StopOutlined />}
                      loading={cancelTaskMutation.isPending}
                      onClick={() => cancelTaskMutation.mutate(record.id)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* 商品上架：AI 识别结果 → 商品草稿预览 */}
      {isProductLaunch && recognitionResult && (
        <Card
          title={<><EditOutlined style={{ marginRight: 8, color: '#16a34a' }} />{t('agent.recognizeResult')}</>}
          extra={
            <Space>
              <Tag color="green" style={{ fontSize: 11 }}>
                <CheckCircleOutlined /> {t('agent.recognizeDone')} · {fileList.length} {t('common.images')}
              </Tag>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setTaskModalOpen(true);
                }}
              >
                {t('agent.regenerate')}
              </Button>
            </Space>
          }
          style={{ marginBottom: 16, borderLeft: '3px solid #16a34a' }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={16}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.recognizedProductName')}</Typography.Text>
              <Input
                style={{ marginTop: 4 }}
                value={recognitionResult.productName}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, productName: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.generatedPrice')}</Typography.Text>
              <Input
                style={{ marginTop: 4 }}
                prefix="$"
                value={recognitionResult.suggestedPrice}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, suggestedPrice: Number(e.target.value) || 0 })}
              />
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.recognizedCategory')}</Typography.Text>
              <Input
                style={{ marginTop: 4 }}
                value={recognitionResult.category}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, category: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.recognizedAttributes')}</Typography.Text>
              <Input.TextArea
                style={{ marginTop: 4 }}
                rows={2}
                value={recognitionResult.attributes}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, attributes: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.generatedSeoTitle')}</Typography.Text>
              <Input.TextArea
                style={{ marginTop: 4 }}
                rows={2}
                value={recognitionResult.seoTitle}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, seoTitle: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.generatedSellingPoints')}</Typography.Text>
              <Input.TextArea
                style={{ marginTop: 4 }}
                rows={3}
                value={recognitionResult.sellingPoints}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, sellingPoints: e.target.value })}
              />
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.generatedDescription')}</Typography.Text>
              <Input.TextArea
                style={{ marginTop: 4 }}
                rows={4}
                value={recognitionResult.description}
                onChange={(e) => setRecognitionResult({ ...recognitionResult, description: e.target.value })}
              />
            </Col>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={createTaskMutation.isPending}
              onClick={() => {
                createTaskMutation.mutate({
                  title: recognitionResult.seoTitle,
                  goal: `上架商品「${recognitionResult.productName}」到 ${stores.find(s => s.id === taskForm.getFieldValue('storeId'))?.name || stores[0]?.name || ''}`,
                  storeId: taskForm.getFieldValue('storeId') || stores[0]?.id
                });
              }}
            >
              {t('agent.confirmCreateTask')}
            </Button>
          </div>
        </Card>
      )}

      {/* 新建任务按钮（无运行中任务时单独显示，店铺保活除外） */}
      {!isLoginBootstrap && activeTasks.length === 0 && !recognitionResult && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Typography.Paragraph type="secondary">{t('agent.noActiveTasks')}</Typography.Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
              {isProductLaunch ? t('agent.uploadProduct') : t('agent.newTask')}
            </Button>
          </div>
        </Card>
      )}

      {/* 任务日志 */}
      {logTasks.length > 0 && (
        <Card title={<><CheckCircleOutlined /> {t('agent.taskLogs')} ({logTasks.length})</>}>
          <Table
            rowKey="id"
            dataSource={logTasks}
            pagination={{ pageSize: 10, size: 'small' }}
            size="small"
            columns={[
              { title: t('entity.task'), dataIndex: 'title', render: (title: string) => <Typography.Text strong>{title}</Typography.Text> },
              { title: t('agent.taskGoal'), dataIndex: 'goal', render: (goal: string) => <Typography.Text type="secondary" style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal}</Typography.Text> },
              { title: t('stores.status'), dataIndex: 'status', width: 120, render: (status: TaskStatus) => <StatusBadge value={status} /> },
              { title: t('stores.createdAt'), dataIndex: 'createdAt', width: 140, render: (v: string) => new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              {
                title: t('agent.taskTimeline'),
                dataIndex: 'timeline',
                render: (timeline: Task['timeline']) => timeline.length > 0 ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {timeline[timeline.length - 1].title} · {new Date(timeline[timeline.length - 1].at).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography.Text>
                ) : '-'
              },
              {
                title: t('common.actions'),
                width: 100,
                render: (_: unknown, record: Task) => {
                  const needsAuth = record.timeline.some((e) => e.type === 'login_required');
                  if (!needsAuth) return null;
                  return (
                    <Button
                      size="small"
                      type="primary"
                      icon={<KeyOutlined />}
                      onClick={() => navigate(`/stores/${record.storeId}`)}
                    >
                      {t('agent.manualAuth')}
                    </Button>
                  );
                }
              }
            ]}
          />
        </Card>
      )}

      {/* 新建任务弹窗 */}
      <Modal
        title={isProductLaunch ? t('agent.imageRecognition') : t('agent.newTask')}
        open={taskModalOpen}
        onOk={isProductLaunch ? undefined : () => taskForm.submit()}
        onCancel={() => { setTaskModalOpen(false); taskForm.resetFields(); setFileList([]); setProductStep(0); setRecognitionResult(null); }}
        confirmLoading={createTaskMutation.isPending}
        width={isProductLaunch ? 760 : 520}
        footer={isProductLaunch ? null : undefined}
      >
        {/* ===== 商品上架：上传商品弹窗 ===== */}
        {isProductLaunch ? (
          <div>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
              {t('agent.imageRecognitionDesc')}
            </Typography.Paragraph>
            <Form layout="vertical">
              <Form.Item label={t('entity.storeName')}>
                <Select
                  style={{ width: '100%' }}
                  value={taskForm.getFieldValue('storeId') || stores[0]?.id}
                  onChange={(v) => taskForm.setFieldsValue({ storeId: v })}
                  options={stores.map((s) => ({ value: s.id, label: s.name }))}
                />
              </Form.Item>
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
            </Form>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button onClick={() => { setTaskModalOpen(false); setFileList([]); }}>
                {t('common.cancel')}
              </Button>
              <Button
                type="primary"
                icon={<CameraOutlined />}
                loading={recognizing}
                onClick={handleStartRecognize}
                style={{ marginLeft: 8 }}
                disabled={fileList.length === 0}
              >
                {recognizing ? t('agent.recognizing') : t('agent.startRecognize')}
              </Button>
            </div>
          </div>
        ) : (
          /* ===== 通用任务弹窗（非商品上架） ===== */
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
              <Select options={stores.map((s) => ({ value: s.id, label: s.name }))} />
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
        )}
      </Modal>

      <AgentWorkflowModals
        reviewOpen={reviewModalOpen}
        onCloseReview={() => setReviewModalOpen(false)}
        customerServiceOpen={csModalOpen}
        onCloseCustomerService={() => setCsModalOpen(false)}
        adsDashboardOpen={adDashboardOpen}
        onCloseAdsDashboard={() => setAdDashboardOpen(false)}
        creativeOpen={creativeModalOpen}
        onCloseCreative={() => setCreativeModalOpen(false)}
        riskOpen={riskModalOpen}
        onCloseRisk={() => setRiskModalOpen(false)}
        liveOpen={liveModalOpen}
        onCloseLive={() => setLiveModalOpen(false)}
        crmOpen={crmModalOpen}
        onCloseCrm={() => setCrmModalOpen(false)}
      />
    </div>
  );
}
