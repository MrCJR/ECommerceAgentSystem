import { BankOutlined, BellOutlined, CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, CustomerServiceOutlined, DollarOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, FireOutlined, FundOutlined, GiftOutlined, GlobalOutlined, InfoCircleOutlined, KeyOutlined, LineChartOutlined, MessageOutlined, PictureOutlined, PlayCircleOutlined, PlusOutlined, PushpinOutlined, RadarChartOutlined, ReloadOutlined, RobotOutlined, SafetyOutlined, SearchOutlined, SendOutlined, SettingOutlined, ShoppingCartOutlined, SkinOutlined, SmileOutlined, StarOutlined, StopOutlined, TeamOutlined, ThunderboltOutlined, ToolOutlined, UnorderedListOutlined, WalletOutlined, WarningOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Rate,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
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
import { EmptyState } from '../components/EmptyState';
import type { AgentConfig, AgentType, Task, TaskStatus } from '../types/domain';
import {
  mockBreakerLogs,
  mockBudgetSuggestions,
  mockCampaigns,
  mockChats,
  mockChurnRisks,
  mockConversations,
  mockCoupons,
  mockCreatives,
  mockLiveComments,
  mockLiveMetrics,
  mockLiveProducts,
  mockReviews,
  mockRiskScans,
  mockSegments,
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
    mutationFn: (values: { title?: string; goal?: string; storeId: string }) =>
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
    mutationFn: (taskId: string) => agentsApi.cancelTask(taskId),
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
  const [reviewTab, setReviewTab] = useState<string>('pending');
  const [reviewState, setReviewState] = useState<Record<number, 'pending' | 'replied' | 'dismissed'>>({
    1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending',
  });
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewEdits, setReviewEdits] = useState<Record<number, string>>({});
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csActiveChat, setCsActiveChat] = useState(0);
  const [csInput, setCsInput] = useState('');
  const [adDashboardOpen, setAdDashboardOpen] = useState(false);
  const [adOptimizeOpen, setAdOptimizeOpen] = useState(false);

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

      {/* 定价策略：内置任务卡片 */}
      {isPricingStrategy && (
        <Card title={<><DollarOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.priceScan')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.priceScanDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ToolOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.dynamicPrice')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.dynamicPriceDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.floorProtect')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.floorProtectDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 店铺保活：内置任务卡片 */}
      {isLoginBootstrap && (
        <Card
          title={<><UnorderedListOutlined /> {t('agent.builtinTasks')}</>}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                size="small"
                style={{ background: 'var(--ark-panel-soft)' }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                    {t('agent.sessionCheckTask')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                    {t('agent.sessionCheckTaskDesc')}
                  </Typography.Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                size="small"
                style={{ background: 'var(--ark-panel-soft)' }}
              >
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <BellOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                    {t('agent.sessionFailedTask')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                    {t('agent.sessionFailedTaskDesc')}
                  </Typography.Paragraph>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GlobalOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.bulkPatrol')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.bulkPatrolDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 市场情报：内置任务卡片 */}
      {isCompetitorIntel && (
        <Card
          title={<><RadarChartOutlined /> {t('agent.builtinTasks')}</>}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.passiveCompetitorMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.passiveCompetitorMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SearchOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.productResearch')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.productResearchDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GlobalOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.trendMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.trendMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 商品上架：内置任务卡片 */}
      {isProductLaunch && (
        <Card title={<><CameraOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <div>
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    <CameraOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                    {t('agent.imageRecognition')}
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                    {t('agent.imageRecognitionDesc')}
                  </Typography.Paragraph>
                </div>
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.active')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.draftGeneration')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.draftGenerationDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SafetyOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.complianceCheck')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.complianceCheckDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 广告投放：内置任务卡片 */}
      {isAdsOptimizer && (
        <Card title={<><ThunderboltOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setAdDashboardOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <LineChartOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.roiPatrol')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.roiPatrolDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ToolOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.budgetOptimize')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.budgetOptimizeDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FireOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.abTest')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.abTestDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* CRM 复购：内置任务卡片 */}
      {isCrmRetention && (
        <Card title={<><GiftOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" hoverable style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setCrmModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SkinOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.segmentRefresh')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.segmentRefreshDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <GiftOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.couponSend')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.couponSendDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.churnPredict')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.churnPredictDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <CrownOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
                  {t('agent.vipCare')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.vipCareDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 评价管理：内置任务卡片 */}
      {isReviewManager && (
        <Card title={<><StarOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setReviewModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.negativeMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.negativeMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.autoReply')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.autoReplyDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SmileOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.reviewInvite')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.reviewInviteDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 客服消息：内置任务卡片 */}
      {isCustomerService && (
        <Card title={<><CustomerServiceOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" hoverable style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setCsModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SmileOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.smartReply')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.smartReplyDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.escalateHuman')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.escalateHumanDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <SearchOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
                  {t('agent.faqLearn')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.faqLearnDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 售后处理：内置任务卡片 */}
      {isAfterSales && (
        <Card title={<><ToolOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.returnAudit')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.returnAuditDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WalletOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.refundProcess')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.refundProcessDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.logisticsTrack')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.logisticsTrackDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 素材工厂：内置任务卡片 */}
      {isCreativeFactory && (
        <Card title={<><PictureOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setCreativeModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <PictureOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.imageGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.imageGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <CameraOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.videoGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.videoGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.copyGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.copyGenDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 库存预警：内置任务卡片 */}
      {isInventoryAlert && (
        <Card title={<><ShoppingCartOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.lowStockAlert')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.lowStockAlertDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <StopOutlined style={{ color: '#64748b', marginRight: 6 }} />
                  {t('agent.deadStock')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.deadStockDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.replenish')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.replenishDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 风险控制：内置任务卡片 */}
      {isRiskControl && (
        <Card title={<><SafetyOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setRiskModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.complianceScan')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.complianceScanDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EyeOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.behaviorMonitor')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.behaviorMonitorDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <StopOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.circuitBreaker')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.circuitBreakerDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 财务对账：内置任务卡片 */}
      {isFinanceAudit && (
        <Card title={<><BankOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <FileSearchOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.monthlyReconcile')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.monthlyReconcileDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.discrepancyMark')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.discrepancyMarkDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <EditOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.reportGen')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.reportGenDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 促销活动：内置任务卡片 */}
      {isPromotionCampaign && (
        <Card title={<><GiftOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ThunderboltOutlined style={{ color: '#dc2626', marginRight: 6 }} />
                  {t('agent.flashSaleSetup')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.flashSaleSetupDesc')}
                </Typography.Paragraph>
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.active')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <DollarOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.couponCampaign')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.couponCampaignDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <ShoppingCartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.bundleDeal')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.bundleDealDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 直播运营：内置任务卡片 */}
      {isLiveStreamOps && (
        <Card title={<><CustomerServiceOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card hoverable size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%', cursor: 'pointer' }} onClick={() => setLiveModalOpen(true)}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <UnorderedListOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                  {t('agent.liveSchedule')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.liveScheduleDesc')}
                </Typography.Paragraph>
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <PushpinOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.productPinning')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.productPinningDesc')}
                </Typography.Paragraph>
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <LineChartOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                  {t('agent.liveMetrics')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.liveMetricsDesc')}
                </Typography.Paragraph>
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 策略配置 */}
      {agent.strategyConfig && (
        <Card title={<><SettingOutlined /> {t('agent.strategyConfig')}</>} style={{ marginBottom: 16 }}>
          {agent.strategyConfig.pricingRule && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.pricingRule')}</Typography.Title>

              {/* 模式选择 */}
              <div style={{ marginBottom: 16 }}>
                <Space size="large">
                  <Typography.Text strong>{t('agent.pricingMode')}:</Typography.Text>
                  <Select
                    value={agent.strategyConfig.pricingRule.mode}
                    style={{ width: 140 }}
                    onChange={(v) => {
                      const pr = agent.strategyConfig!.pricingRule!;
                      pr.mode = v;
                      if (v === 'market') { pr.targetMargin = 30; pr.competitorStrategy = 'match'; }
                      if (v === 'cost') { pr.costMultiplier = 1.5; pr.roundUp = true; }
                      if (v === 'manual') { pr.floorPrice = 0; pr.ceilingPrice = 0; }
                    }}
                    options={[
                      { value: 'market', label: t('agent.pricingMarket') },
                      { value: 'cost', label: t('agent.pricingCost') },
                      { value: 'manual', label: t('agent.pricingManual') },
                    ]}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {t(`agent.pricingMode_${agent.strategyConfig.pricingRule.mode}`)}
                  </Typography.Text>
                </Space>
              </div>

              {/* 市场驱动模式 */}
              {agent.strategyConfig.pricingRule.mode === 'market' && (
                <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8 }}>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                    {t('agent.pricingMarketDesc')}
                  </Typography.Paragraph>
                  <Space size="large">
                    <Space>
                      <Typography.Text type="secondary">{t('agent.targetMargin')}:</Typography.Text>
                      <InputNumber
                        min={5} max={80} step={5}
                        style={{ width: 80 }}
                        suffix="%"
                        value={agent.strategyConfig.pricingRule.targetMargin}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.targetMargin = v ?? 30; }}
                      />
                    </Space>
                    <Space>
                      <Typography.Text type="secondary">{t('agent.competeStrategy')}:</Typography.Text>
                      <Select
                        size="small"
                        style={{ width: 120 }}
                        value={agent.strategyConfig.pricingRule.competitorStrategy}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.competitorStrategy = v; }}
                        options={[
                          { value: 'undercut', label: t('agent.competeUndercut') },
                          { value: 'match', label: t('agent.competeMatch') },
                          { value: 'premium', label: t('agent.competePremium') },
                        ]}
                      />
                    </Space>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                    {t('agent.pricingMarketNote')}: {t('agent.competitorAgent')}
                  </Typography.Text>
                </div>
              )}

              {/* 成本驱动模式 */}
              {agent.strategyConfig.pricingRule.mode === 'cost' && (
                <div>
                  <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8, marginBottom: 12 }}>
                    <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                      {t('agent.pricingCostDesc')}
                    </Typography.Paragraph>
                    <Space size="large" wrap>
                      <Space>
                        <Typography.Text type="secondary">{t('agent.costMultiplier')}:</Typography.Text>
                        <InputNumber
                          min={1} max={5} step={0.1}
                          style={{ width: 70 }}
                          value={agent.strategyConfig.pricingRule.costMultiplier}
                          onChange={(v) => {
                            if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.costMultiplier = v ?? 1.5;
                          }}
                        />
                        <Typography.Text type="secondary">× {t('agent.cost')}</Typography.Text>
                      </Space>
                      <Space>
                        <Typography.Text type="secondary">{t('agent.roundUp')}:</Typography.Text>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.pricingRule.roundUp}
                          onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.roundUp = v; }}
                        />
                      </Space>
                    </Space>
                  </div>
                  {/* 上传进货单 */}
                  <Upload
                    accept=".xlsx,.xls,.csv"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={(info) => {
                      if (info.fileList.length > 0 && agent.strategyConfig?.pricingRule) {
                        agent.strategyConfig.pricingRule.costFile = info.fileList[0].name;
                      }
                    }}
                  >
                    <Button icon={<PlusOutlined />} size="small">
                      {agent.strategyConfig.pricingRule.costFile
                        ? t('agent.costFileUploaded') + ': ' + agent.strategyConfig.pricingRule.costFile
                        : t('agent.uploadCostFile')}
                    </Button>
                  </Upload>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    {t('agent.uploadCostFileHint')}
                  </Typography.Text>
                </div>
              )}

              {/* 自主定价模式 */}
              {agent.strategyConfig.pricingRule.mode === 'manual' && (
                <div style={{ padding: '12px 16px', background: 'var(--ark-panel-soft)', borderRadius: 8 }}>
                  <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
                    {t('agent.pricingManualDesc')}
                  </Typography.Paragraph>
                  <Space size="large">
                    <Space>
                      <Typography.Text type="secondary">{t('agent.floorPrice')}:</Typography.Text>
                      <InputNumber
                        min={0} step={1}
                        style={{ width: 100 }}
                        prefix="$"
                        value={agent.strategyConfig.pricingRule.floorPrice}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.floorPrice = v ?? 0; }}
                      />
                    </Space>
                    <Space>
                      <Typography.Text type="secondary">{t('agent.ceilingPrice')}:</Typography.Text>
                      <InputNumber
                        min={0} step={1}
                        style={{ width: 100 }}
                        prefix="$"
                        value={agent.strategyConfig.pricingRule.ceilingPrice}
                        onChange={(v) => { if (agent.strategyConfig?.pricingRule) agent.strategyConfig.pricingRule.ceilingPrice = v ?? 0; }}
                      />
                    </Space>
                  </Space>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                    {t('agent.pricingManualNote')}
                  </Typography.Text>
                </div>
              )}
            </div>
          )}

          {agent.strategyConfig.adSpendBudget && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.adSpendBudget')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.adSpendBudgetDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.dailyCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={50}
                    style={{ width: 120 }}
                    prefix="$"
                    value={agent.strategyConfig.adSpendBudget.dailyCap}
                    onChange={(v) => {
                      const sc = agent.strategyConfig!;
                      if (sc.adSpendBudget) {
                        sc.adSpendBudget.dailyCap = v ?? 0;
                        agentsApi.saveStrategyConfig(agent.agentType, {
                          dailyCap: v ?? 0
                        });
                      }
                    }}
                  />
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.monthlyCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={500}
                    style={{ width: 120 }}
                    prefix="$"
                    value={agent.strategyConfig.adSpendBudget.monthlyCap}
                    onChange={(v) => {
                      const sc = agent.strategyConfig!;
                      if (sc.adSpendBudget) sc.adSpendBudget.monthlyCap = v ?? 0;
                    }}
                  />
                </Space>
              </Space>
            </div>
          )}

          {agent.strategyConfig.seoKeywords && agent.strategyConfig.seoKeywords.keywords.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>{t('agent.seoKeywords')}</Typography.Title>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => {
                  agentsApi.regenerateSeoKeywords(agent.agentType).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['agent', agentType] });
                    message.success(t('agent.seoRegenerated'));
                  });
                }}>{t('agent.reResearch')}</Button>
              </div>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>{t('agent.seoKeywordsDesc')}</Typography.Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.strategyConfig.seoKeywords.keywords.map((kw) => (
                  <Tag key={kw} color="blue">{kw}</Tag>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                {t('agent.generatedBy')} {t('agent.competitorAgent')} · {new Date(agent.strategyConfig.seoKeywords.lastGenerated).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>
            </div>
          )}

          {agent.strategyConfig.targetAudience && agent.strategyConfig.targetAudience.tags.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>{t('agent.targetAudience')}</Typography.Title>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => {
                  agentsApi.regenerateAudience(agent.agentType).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['agent', agentType] });
                    message.success(t('agent.audienceRegenerated'));
                  });
                }}>{t('agent.reResearch')}</Button>
              </div>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>{t('agent.targetAudienceDesc')}</Typography.Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {agent.strategyConfig.targetAudience.tags.map((tag) => (
                  <Tag key={tag} color="purple">{tag}</Tag>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                {t('agent.generatedBy')} {t('agent.competitorAgent')} · {new Date(agent.strategyConfig.targetAudience.lastGenerated).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography.Text>
            </div>
          )}

          {agent.strategyConfig.crmConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.crmDiscountCap')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.crmConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.crmDiscountCap')}:</Typography.Text>
                  <InputNumber
                    min={0} max={100} step={5}
                    style={{ width: 80 }}
                    value={agent.strategyConfig.crmConfig.discountCap}
                    onChange={(v) => { if (agent.strategyConfig?.crmConfig) agent.strategyConfig.crmConfig.discountCap = v ?? 20; }}
                    suffix="%"
                  />
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.crmSegmentCount')}:</Typography.Text>
                  <InputNumber
                    min={1} max={10} step={1}
                    style={{ width: 80 }}
                    value={agent.strategyConfig.crmConfig.segmentCount}
                    onChange={(v) => { if (agent.strategyConfig?.crmConfig) agent.strategyConfig.crmConfig.segmentCount = v ?? 3; }}
                  />
                </Space>
              </Space>
            </div>
          )}

          {agent.strategyConfig.afterSalesConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.afterSalesRefundCap')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.afterSalesConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.afterSalesRefundCap')}:</Typography.Text>
                  <InputNumber
                    min={0} step={5}
                    style={{ width: 100 }}
                    prefix="$"
                    value={agent.strategyConfig.afterSalesConfig.autoRefundCap}
                    onChange={(v) => { if (agent.strategyConfig?.afterSalesConfig) agent.strategyConfig.afterSalesConfig.autoRefundCap = v ?? 20; }}
                  />
                  <Typography.Text type="secondary">{t('agent.afterSalesRefundCapUnit')}</Typography.Text>
                </Space>
              </Space>
              <div style={{ marginTop: 8 }}>
                <Typography.Text type="secondary">{t('agent.afterSalesReturnAddr')}:</Typography.Text>
                <Input
                  style={{ width: 280, marginLeft: 8 }}
                  size="small"
                  placeholder={t('agent.afterSalesReturnAddrPlaceholder')}
                  value={agent.strategyConfig.afterSalesConfig.returnAddress}
                  onChange={(e) => { if (agent.strategyConfig?.afterSalesConfig) agent.strategyConfig.afterSalesConfig.returnAddress = e.target.value; }}
                />
              </div>
            </div>
          )}

          {agent.strategyConfig.creativeConfig && (
            <div style={{ marginBottom: 8 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.creativeSizes')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.creativeConfigDesc')}</Typography.Paragraph>
              <Space size="large">
                <Space>
                  <Typography.Text type="secondary">{t('agent.creativeSizes')}:</Typography.Text>
                  <Input
                    style={{ width: 180 }}
                    size="small"
                    placeholder="1:1,16:9,9:16"
                    value={agent.strategyConfig.creativeConfig.outputSizes}
                    onChange={(e) => { if (agent.strategyConfig?.creativeConfig) agent.strategyConfig.creativeConfig.outputSizes = e.target.value; }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.creativeSizesDesc')}</Typography.Text>
                </Space>
              </Space>
              <Space style={{ marginTop: 8 }}>
                <Typography.Text type="secondary">{t('agent.creativeTone')}:</Typography.Text>
                <Select
                  size="small"
                  style={{ width: 120 }}
                  value={agent.strategyConfig.creativeConfig.copyTone}
                  onChange={(v) => { if (agent.strategyConfig?.creativeConfig) agent.strategyConfig.creativeConfig.copyTone = v; }}
                  options={[
                    { value: '简洁卖点', label: '简洁卖点' },
                    { value: '促销感', label: '促销感' },
                    { value: '高端品牌', label: '高端品牌' },
                    { value: '年轻潮流', label: '年轻潮流' }
                  ]}
                />
              </Space>
            </div>
          )}

          {agent.strategyConfig.riskControlConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 12 }}>{t('agent.riskControlTitle')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>{t('agent.riskControlDesc')}</Typography.Paragraph>

              <Row gutter={[24, 16]}>
                {/* 法规合规 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskCompliance')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.adLawFilter}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.adLawFilter = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskAdLaw')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.platformRuleCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.platformRuleCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskPlatformRule')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.compliance.falseClaimDetection}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.compliance.falseClaimDetection = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskFalseClaim')}</Typography.Text>
                      </Space>
                    </Space>
                  </Card>
                </Col>

                {/* 行为监控 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskBehavior')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskRoiFloor')}:</Typography.Text>
                        <InputNumber
                          size="small" min={0} step={0.1}
                          style={{ width: 70 }}
                          value={agent.strategyConfig.riskControlConfig.behavior.roiFloorThreshold}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.roiFloorThreshold = v ?? 1.2; }}
                        />
                      </Space>
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskFreqLimit')}:</Typography.Text>
                        <InputNumber
                          size="small" min={1} max={100} step={1}
                          style={{ width: 70 }}
                          suffix="次/分"
                          value={agent.strategyConfig.riskControlConfig.behavior.actionFrequencyLimit}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.actionFrequencyLimit = v ?? 10; }}
                        />
                      </Space>
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 60 }}>{t('agent.riskPriceDev')}:</Typography.Text>
                        <InputNumber
                          size="small" min={5} max={100} step={5}
                          style={{ width: 70 }}
                          suffix="%"
                          value={agent.strategyConfig.riskControlConfig.behavior.priceDeviationPercent}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.behavior.priceDeviationPercent = v ?? 30; }}
                        />
                      </Space>
                    </Space>
                  </Card>
                </Col>

                {/* 业务保护 */}
                <Col span={8}>
                  <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>{t('agent.riskBusiness')}</Typography.Text>}
                    style={{ background: 'var(--ark-panel-soft)' }}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12, width: 72 }}>{t('agent.riskMinPrice')}:</Typography.Text>
                        <InputNumber
                          size="small" min={0} max={2} step={0.05}
                          style={{ width: 70 }}
                          suffix="×成本"
                          value={agent.strategyConfig.riskControlConfig.business.minPriceRatio}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.minPriceRatio = v ?? 0.8; }}
                        />
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.categoryMatchCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.categoryMatchCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskCategory')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.imageComplianceCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.imageComplianceCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskImage')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.inventorySafetyCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.inventorySafetyCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskInventory')}</Typography.Text>
                      </Space>
                      <Space>
                        <Switch
                          size="small"
                          checked={agent.strategyConfig.riskControlConfig.business.negativeReviewSurgeCheck}
                          onChange={(v) => { if (agent.strategyConfig?.riskControlConfig) agent.strategyConfig.riskControlConfig.business.negativeReviewSurgeCheck = v; }}
                        />
                        <Typography.Text style={{ fontSize: 13 }}>{t('agent.riskReviewSurge')}</Typography.Text>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* 库存预警配置 */}
          {agent.strategyConfig.inventoryConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.inventoryConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.inventoryConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.lowStockThreshold')}:</Typography.Text>
                    <InputNumber
                      min={1} max={9999} step={10}
                      style={{ width: 100 }}
                      value={agent.strategyConfig.inventoryConfig.lowStockThreshold}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.lowStockThreshold = v ?? 50; }}
                      suffix={t('common.items')}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.deadStockDays')}:</Typography.Text>
                    <InputNumber
                      min={7} max={365} step={7}
                      style={{ width: 100 }}
                      value={agent.strategyConfig.inventoryConfig.deadStockDays}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.deadStockDays = v ?? 30; }}
                      suffix={t('common.day')}
                    />
                  </Space>
                </Space>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoReplenish')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.inventoryConfig.autoReplenishEnabled}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.autoReplenishEnabled = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoReplenishDesc')}</Typography.Text>
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.replenishLeadTime')}:</Typography.Text>
                    <InputNumber
                      min={1} max={60} step={1}
                      style={{ width: 80 }}
                      value={agent.strategyConfig.inventoryConfig.replenishLeadTimeDays}
                      onChange={(v) => { if (agent.strategyConfig?.inventoryConfig) agent.strategyConfig.inventoryConfig.replenishLeadTimeDays = v ?? 7; }}
                      suffix={t('common.day')}
                    />
                  </Space>
                </Space>
              </Space>
            </div>
          )}

          {/* 市场情报配置 */}
          {agent.strategyConfig.intelConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.intelConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.intelConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space>
                  <Typography.Text type="secondary">{t('agent.monitorFrequency')}:</Typography.Text>
                  <InputNumber
                    min={1} max={168} step={1}
                    style={{ width: 100 }}
                    value={agent.strategyConfig.intelConfig.monitorFrequencyHours}
                    onChange={(v) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.monitorFrequencyHours = v ?? 2; }}
                    suffix={t('agent.monitorFrequencyUnit')}
                  />
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.monitoredCategories')}:</Typography.Text>
                  <Input
                    style={{ maxWidth: 400 }}
                    placeholder={t('agent.monitoredCategoriesDesc')}
                    value={agent.strategyConfig.intelConfig.monitoredCategories.join('，')}
                    onChange={(e) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.monitoredCategories = e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean); }}
                  />
                </div>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.competitorUrls')}:</Typography.Text>
                  <Input.TextArea
                    style={{ maxWidth: 400 }}
                    rows={3}
                    placeholder={t('agent.competitorUrlsDesc')}
                    value={agent.strategyConfig.intelConfig.competitorUrls.join('\n')}
                    onChange={(e) => { if (agent.strategyConfig?.intelConfig) agent.strategyConfig.intelConfig.competitorUrls = e.target.value.split('\n').filter(Boolean); }}
                  />
                </div>
              </Space>
            </div>
          )}

          {/* 财务对账配置 */}
          {agent.strategyConfig.financeConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.financeConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.financeConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoReconcileDay')}:</Typography.Text>
                    <InputNumber
                      min={1} max={28} step={1}
                      style={{ width: 80 }}
                      value={agent.strategyConfig.financeConfig.autoReconcileDay}
                      onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.autoReconcileDay = v ?? 5; }}
                      suffix={t('agent.autoReconcileDayUnit')}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.discrepancyAlert')}:</Typography.Text>
                    <InputNumber
                      min={1} step={10}
                      style={{ width: 120 }}
                      prefix="$"
                      value={agent.strategyConfig.financeConfig.discrepancyAlertThreshold}
                      onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.discrepancyAlertThreshold = v ?? 100; }}
                    />
                  </Space>
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.autoGenReport')}:</Typography.Text>
                  <Switch
                    checked={agent.strategyConfig.financeConfig.autoGenerateReport}
                    onChange={(v) => { if (agent.strategyConfig?.financeConfig) agent.strategyConfig.financeConfig.autoGenerateReport = v; }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoGenReportDesc')}</Typography.Text>
                </Space>
              </Space>
            </div>
          )}

          {/* 促销活动配置 */}
          {agent.strategyConfig.promotionConfig && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.promotionConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.promotionConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.maxDiscount')}:</Typography.Text>
                    <InputNumber
                      min={1} max={90} step={5}
                      style={{ width: 80 }}
                      suffix="%"
                      value={agent.strategyConfig.promotionConfig.maxDiscountPercent}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.maxDiscountPercent = v ?? 50; }}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.campaignBudget')}:</Typography.Text>
                    <InputNumber
                      min={100} step={100}
                      style={{ width: 120 }}
                      prefix="$"
                      value={agent.strategyConfig.promotionConfig.campaignBudget}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.campaignBudget = v ?? 2000; }}
                    />
                  </Space>
                </Space>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoSchedule')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.promotionConfig.autoSchedule}
                      onChange={(v) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.autoSchedule = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.autoScheduleDesc')}</Typography.Text>
                  </Space>
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.targetPlatforms')}:</Typography.Text>
                  <Input
                    style={{ maxWidth: 400 }}
                    value={agent.strategyConfig.promotionConfig.targetPlatforms.join('，')}
                    onChange={(e) => { if (agent.strategyConfig?.promotionConfig) agent.strategyConfig.promotionConfig.targetPlatforms = e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean); }}
                  />
                </div>
              </Space>
            </div>
          )}

          {/* 直播运营配置 */}
          {agent.strategyConfig.liveStreamConfig && (
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>{t('agent.liveStreamConfig')}</Typography.Title>
              <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>{t('agent.liveStreamConfigDesc')}</Typography.Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space size="large" wrap>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.autoPinProducts')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.liveStreamConfig.autoPinProducts}
                      onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.autoPinProducts = v; }}
                    />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">{t('agent.peakHourBoost')}:</Typography.Text>
                    <Switch
                      checked={agent.strategyConfig.liveStreamConfig.peakHourBoost}
                      onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.peakHourBoost = v; }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>{t('agent.peakHourBoostDesc')}</Typography.Text>
                  </Space>
                </Space>
                <Space>
                  <Typography.Text type="secondary">{t('agent.performanceAlert')}:</Typography.Text>
                  <InputNumber
                    min={50} max={10000} step={50}
                    style={{ width: 120 }}
                    suffix={t('agent.performanceAlertUnit')}
                    value={agent.strategyConfig.liveStreamConfig.performanceAlertThreshold}
                    onChange={(v) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.performanceAlertThreshold = v ?? 500; }}
                  />
                </Space>
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>{t('agent.replyTemplate')}:</Typography.Text>
                  <Input.TextArea
                    style={{ maxWidth: 400 }}
                    rows={2}
                    placeholder={t('agent.replyTemplateDesc')}
                    value={agent.strategyConfig.liveStreamConfig.replyTemplate}
                    onChange={(e) => { if (agent.strategyConfig?.liveStreamConfig) agent.strategyConfig.liveStreamConfig.replyTemplate = e.target.value; }}
                  />
                </div>
              </Space>
            </div>
          )}
        </Card>
      )}

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
                  // 非商品上架或无草稿数据，退回时间线
                  return record.timeline.length > 0 ? (
                    <div style={{ padding: '4px 0 4px 8px' }}>
                      <Timeline
                        items={record.timeline.map((e) => ({
                          color: e.type === 'run_failed' || e.type === 'login_required' ? 'red'
                            : e.type === 'approval_required' ? 'orange'
                            : e.type === 'run_succeeded' ? 'green'
                            : 'blue',
                          children: (
                            <div>
                              <Typography.Text strong style={{ fontSize: 13 }}>{e.title}</Typography.Text>
                              <br />
                              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                {new Date(e.at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {' · '}{e.summary}
                              </Typography.Text>
                            </div>
                          )
                        }))}
                      />
                    </div>
                  ) : (
                    <Typography.Text type="secondary">{t('common.empty')}</Typography.Text>
                  );
                }
                // 商品草稿完整预览
                return (
                  <div style={{ padding: 8, overflow: 'hidden', maxWidth: '100%' }}>
                    <Row gutter={[16, 12]}>
                      {/* 基础信息 */}
                      <Col span={24}>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>商品名称</Typography.Text>
                        <Typography.Text strong style={{ display: 'block', fontSize: 14, wordBreak: 'break-word' }}>{draft.productName}</Typography.Text>
                        <Space size="small" style={{ marginTop: 2 }}>
                          <Tag color="blue">{draft.platform}</Tag>
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>{draft.category}</Typography.Text>
                        </Space>
                      </Col>

                      {/* SKU 规格 */}
                      <Col xs={24} md={14} style={{ minWidth: 0 }}>
                        <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>SKU规格信息</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                          <Table
                            rowKey="skuCode"
                            dataSource={draft.skus}
                            pagination={false}
                            size="small"
                            columns={[
                              { title: '规格', dataIndex: 'spec', width: 160, ellipsis: true },
                              { title: 'SKU编码', dataIndex: 'skuCode', width: 120, ellipsis: true, render: (v: string) => <Typography.Text code style={{ fontSize: 11 }}>{v}</Typography.Text> },
                              { title: '售价', dataIndex: 'price', width: 80, align: 'right' as const, render: (v: number) => <Typography.Text strong>${v.toFixed(2)}</Typography.Text> },
                              { title: '库存', dataIndex: 'stock', width: 70, align: 'right' as const },
                            ]}
                          />
                        </Card>
                      </Col>

                      {/* 价格体系 + 库存物流 */}
                      <Col xs={24} md={10} style={{ minWidth: 0 }}>
                        <Space direction="vertical" size={12} style={{ width: '100%', minWidth: 0 }}>
                          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>价格体系</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                            <Row gutter={8}>
                              <Col span={8}><Statistic title="成本价" value={draft.costPrice} prefix="$" precision={2} valueStyle={{ fontSize: 16 }} /></Col>
                              <Col span={8}><Statistic title="售价" value={draft.sellingPrice} prefix="$" precision={2} valueStyle={{ fontSize: 16, color: '#2563eb' }} /></Col>
                              <Col span={8}><Statistic title="毛利率" value={((draft.sellingPrice - draft.costPrice) / draft.sellingPrice * 100).toFixed(0)} suffix="%" valueStyle={{ fontSize: 16, color: '#16a34a' }} /></Col>
                            </Row>
                          </Card>
                          <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>库存与物流</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                            <Descriptions column={1} size="small">
                              <Descriptions.Item label="总库存">{draft.totalStock} 件</Descriptions.Item>
                              <Descriptions.Item label="重量">{draft.weight}</Descriptions.Item>
                              <Descriptions.Item label="尺寸">{draft.dimensions}</Descriptions.Item>
                              <Descriptions.Item label="发货地">{draft.shippingFrom}</Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Space>
                      </Col>

                      {/* 通用属性 + 类目专属属性 */}
                      <Col xs={24} md={12} style={{ minWidth: 0 }}>
                        <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>通用属性</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                          <Descriptions column={2} size="small">
                            {draft.genericAttrs.map((a) => (
                              <Descriptions.Item key={a.label} label={a.label}>{a.value}</Descriptions.Item>
                            ))}
                          </Descriptions>
                        </Card>
                      </Col>
                      <Col xs={24} md={12} style={{ minWidth: 0 }}>
                        <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>类目专属属性</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                          <Descriptions column={2} size="small">
                            {draft.categoryAttrs.map((a) => (
                              <Descriptions.Item key={a.label} label={a.label}>{a.value}</Descriptions.Item>
                            ))}
                          </Descriptions>
                        </Card>
                      </Col>

                      {/* 图文素材 */}
                      <Col span={24}>
                        <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>图文素材</Typography.Text>} style={{ background: '#fafafa', maxWidth: '100%' }}>
                          <Row gutter={[16, 8]}>
                            <Col xs={12} sm={6}><Statistic title="商品主图" value={`${draft.mainImages} 张`} valueStyle={{ fontSize: 14 }} /></Col>
                            <Col xs={12} sm={6}><Statistic title="SKU规格图" value={`${draft.skuImages} 张`} valueStyle={{ fontSize: 14 }} /></Col>
                            <Col xs={12} sm={6}><Statistic title="详情页长图" value={`${draft.detailImages} 张`} valueStyle={{ fontSize: 14 }} /></Col>
                            <Col xs={12} sm={6}>
                              <Statistic title="短视频" value={draft.hasVideo ? '✓ 已生成' : '✗ 未生成'} valueStyle={{ fontSize: 14, color: draft.hasVideo ? '#16a34a' : '#94a3b8' }} />
                            </Col>
                          </Row>
                        </Card>
                      </Col>

                      {/* AI 生成文案预览 */}
                      <Col span={24}>
                        <Card size="small" title={<Typography.Text strong style={{ fontSize: 12 }}>AI 生成文案预览</Typography.Text>} style={{ background: '#f0f5ff', borderLeft: '3px solid #2563eb', maxWidth: '100%' }}>
                          <Space direction="vertical" size={4} style={{ width: '100%', maxWidth: '100%' }}>
                            <div>
                              <Typography.Text type="secondary" style={{ fontSize: 11 }}>SEO 标题（英文）</Typography.Text>
                              <Typography.Paragraph code style={{ fontSize: 12, margin: '2px 0', wordBreak: 'break-all' }}>{draft.seoTitle}</Typography.Paragraph>
                            </div>
                            <div>
                              <Typography.Text type="secondary" style={{ fontSize: 11 }}>核心卖点</Typography.Text>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                                {draft.sellingPoints.map((sp, i) => (
                                  <Tag key={i} color="purple" style={{ fontSize: 11 }}>{sp}</Tag>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Typography.Text type="secondary" style={{ fontSize: 11 }}>详情描述</Typography.Text>
                              <Typography.Paragraph style={{ fontSize: 12, margin: '2px 0', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{draft.description}</Typography.Paragraph>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                      {record.status === 'queued' || record.status === 'draft' ? (
                        <Button size="small" icon={<ReloadOutlined />} onClick={() => { cancelTaskMutation.mutate(record.id); setTaskModalOpen(true); }}>
                          重新生成
                        </Button>
                      ) : null}
                      <Button size="small" danger icon={<StopOutlined />} onClick={() => cancelTaskMutation.mutate(record.id)}>
                        取消
                      </Button>
                      <Button type="primary" size="small" icon={<CheckCircleOutlined />}
                        onClick={() => { message.success(`商品「${draft.productName}」已提交上架`); }}
                      >
                        确认上架
                      </Button>
                    </div>
                  </div>
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

      {/* 评价管理：差评监控弹窗 */}
      <Modal
        title={<><StarOutlined style={{ color: '#ea580c' }} /> {t('agent.reviewCard')}</>}
        open={reviewModalOpen}
        onCancel={() => { setReviewModalOpen(false); setEditingReviewId(null); setReviewTab('pending'); }}
        footer={null}
        width={780}
      >
        <Tabs
          activeKey={reviewTab}
          onChange={(k) => { setReviewTab(k); setEditingReviewId(null); }}
          items={[
            {
              key: 'pending',
              label: `待处理 (${mockReviews.filter(r => reviewState[r.id] === 'pending').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'pending').length === 0 ? (
                    <EmptyState description="所有差评已处理完毕" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'pending').map(review => (
                      <Card
                        key={review.id}
                        size="small"
                        style={{
                          marginBottom: 12,
                          borderLeft: `4px solid ${review.severity === 'high' ? '#dc2626' : review.severity === 'medium' ? '#ea580c' : '#f59e0b'}`
                        }}
                      >
                        {/* 评分 & 买家信息 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                            <Typography.Text strong style={{ marginLeft: 8 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                              {review.product}
                            </Typography.Text>
                          </div>
                          <Space size={4}>
                            <Tag color={review.severity === 'high' ? 'red' : review.severity === 'medium' ? 'orange' : 'gold'} style={{ fontSize: 10 }}>
                              {review.severity === 'high' ? '严重' : review.severity === 'medium' ? '中等' : '轻微'}
                            </Tag>
                            <Typography.Text type="secondary" style={{ fontSize: 10 }}>
                              {review.platform} · {review.orderId}
                            </Typography.Text>
                          </Space>
                        </div>

                        {/* 差评原文 */}
                        <Typography.Paragraph style={{ fontSize: 12, marginBottom: 10, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontStyle: 'italic' }}>
                          "{review.content}"
                        </Typography.Paragraph>

                        {/* AI 建议回复 */}
                        <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, marginBottom: 10, border: '1px solid #bbf7d0' }}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 4 }}>
                            <RobotOutlined style={{ marginRight: 4 }} />{t('agent.reviewReply')} · {review.date}
                          </Typography.Text>
                          {editingReviewId === review.id ? (
                            <Input.TextArea
                              autoSize={{ minRows: 3, maxRows: 6 }}
                              value={reviewEdits[review.id] ?? review.aiReply}
                              onChange={(e) => setReviewEdits(prev => ({ ...prev, [review.id]: e.target.value }))}
                              style={{ fontSize: 12 }}
                            />
                          ) : (
                            <Typography.Paragraph style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-line' }}>
                              {reviewEdits[review.id] || review.aiReply}
                            </Typography.Paragraph>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          {editingReviewId === review.id ? (
                            <>
                              <Button size="small" onClick={() => { setEditingReviewId(null); setReviewEdits(prev => { const next = { ...prev }; delete next[review.id]; return next; }); }}>
                                取消编辑
                              </Button>
                              <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => {
                                setEditingReviewId(null);
                                setReviewState(prev => ({ ...prev, [review.id]: 'replied' }));
                                message.success(t('agent.reviewSent'));
                              }}>
                                确认并发送
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="small" icon={<CloseCircleOutlined />} onClick={() => setReviewState(prev => ({ ...prev, [review.id]: 'dismissed' }))}>
                                {t('agent.reviewDismiss')}
                              </Button>
                              <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingReviewId(review.id); if (!reviewEdits[review.id]) setReviewEdits(prev => ({ ...prev, [review.id]: review.aiReply })); }}>
                                {t('agent.reviewEdit')}
                              </Button>
                              <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => {
                                setReviewState(prev => ({ ...prev, [review.id]: 'replied' }));
                                message.success(t('agent.reviewSent'));
                              }}>
                                {t('agent.reviewSend')}
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )
            },
            {
              key: 'replied',
              label: `已回复 (${mockReviews.filter(r => reviewState[r.id] === 'replied').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'replied').length === 0 ? (
                    <EmptyState description="暂无已回复的差评" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'replied').map(review => (
                      <Card key={review.id} size="small" style={{ marginBottom: 12, borderLeft: '4px solid #16a34a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Space size={4}>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                            <Typography.Text strong style={{ fontSize: 12 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{review.product}</Typography.Text>
                          </Space>
                          <Tag color="green" style={{ fontSize: 10 }}>
                            <CheckCircleOutlined /> 已回复 · {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </Tag>
                        </div>
                        <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '0 0 6px', padding: '6px 10px', background: '#fef2f2', borderRadius: 6 }}>
                          "{review.content.slice(0, 80)}..."
                        </Typography.Paragraph>
                        <Typography.Paragraph style={{ fontSize: 11, margin: 0, padding: '6px 10px', background: '#f0fdf4', borderRadius: 6 }}>
                          {reviewEdits[review.id] || review.aiReply}
                        </Typography.Paragraph>
                      </Card>
                    ))
                  )}
                </div>
              )
            },
            {
              key: 'dismissed',
              label: `已忽略 (${mockReviews.filter(r => reviewState[r.id] === 'dismissed').length})`,
              children: (
                <div style={{ maxHeight: 460, overflow: 'auto' }}>
                  {mockReviews.filter(r => reviewState[r.id] === 'dismissed').length === 0 ? (
                    <EmptyState description="暂无已忽略的差评" />
                  ) : (
                    mockReviews.filter(r => reviewState[r.id] === 'dismissed').map(review => (
                      <Card key={review.id} size="small" style={{ marginBottom: 12, borderLeft: '4px solid #94a3b8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size={4}>
                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 12 }} />
                            <Typography.Text strong style={{ fontSize: 12 }}>{review.buyer}</Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{review.product}</Typography.Text>
                          </Space>
                          <Tag style={{ fontSize: 10 }}>已忽略</Tag>
                        </div>
                        <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '6px 0 0', padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                          "{review.content.slice(0, 80)}..."
                        </Typography.Paragraph>
                      </Card>
                    ))
                  )}
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* 客服消息：客服会话弹窗 */}
      <Modal
        title={<><CustomerServiceOutlined style={{ color: '#2563eb' }} /> {t('agent.csChat')}</>}
        open={csModalOpen}
        onCancel={() => setCsModalOpen(false)}
        footer={null}
        width={860}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', height: 520 }}>
          {/* 会话列表 */}
          <div style={{ width: 220, borderRight: '1px solid var(--ark-border)', overflow: 'auto', background: '#fafbfc' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--ark-border-soft)' }}>
              <Typography.Text strong style={{ fontSize: 12 }}>在线会话</Typography.Text>
              <Badge status="processing" text={<Typography.Text style={{ fontSize: 10 }}>AI 自动回复中</Typography.Text>} style={{ display: 'block', marginTop: 2 }} />
            </div>
            {mockConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => { setCsActiveChat(conv.id); setCsInput(''); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  background: csActiveChat === conv.id ? '#eff6ff' : 'transparent',
                  borderBottom: '1px solid var(--ark-border-soft)',
                  borderLeft: csActiveChat === conv.id ? '3px solid #2563eb' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text strong style={{ fontSize: 13 }}>{conv.name}</Typography.Text>
                  {conv.unread && <Badge status="processing" />}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{conv.product}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }} ellipsis>
                  {conv.escalate && <Tag color="red" style={{ fontSize: 10, marginRight: 4, padding: '0 4px' }}>待转人工</Tag>}
                  {conv.lastMsg}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 10 }}>{conv.time}</Typography.Text>
              </div>
            ))}
          </div>
          {/* 聊天窗口 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 聊天头部 */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--ark-border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div>
                <Typography.Text strong style={{ fontSize: 13 }}>{mockConversations[csActiveChat].name}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  购买: {mockConversations[csActiveChat].product}
                </Typography.Text>
              </div>
              <Space size={4}>
                {mockConversations[csActiveChat].escalate ? (
                  <Tag color="red" style={{ fontSize: 10 }}>已转人工</Tag>
                ) : (
                  <Tag color="green" style={{ fontSize: 10 }}>AI 应答中</Tag>
                )}
              </Space>
            </div>
            {/* 消息列表 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', background: 'var(--ark-bg)' }}>
              {mockChats[csActiveChat].map((msg, i) => (
                <div key={i} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: msg.from === 'buyer' ? 'flex-end' : 'flex-start' }}>
                  {msg.from === 'ai' && (
                    <Typography.Text type="secondary" style={{ fontSize: 9, marginBottom: 2, marginLeft: 4 }}>
                      <RobotOutlined style={{ marginRight: 3 }} />AI Auto-Reply
                    </Typography.Text>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '8px 14px', borderRadius: 12,
                    background: msg.from === 'buyer' ? '#eff6ff' : msg.from === 'agent' ? '#fef9e7' : '#f0fdf4',
                    border: msg.from === 'ai' ? '1px solid #bbf7d0' : msg.from === 'agent' ? '1px solid #fde68a' : '1px solid transparent',
                    fontSize: 12, lineHeight: 1.55
                  }}>
                    {msg.from === 'agent' && <Tag color="gold" style={{ fontSize: 9, marginBottom: 2, padding: '0 3px', lineHeight: '14px' }}>人工客服</Tag>}
                    {msg.text}
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 9, marginTop: 2 }}>{msg.time}</Typography.Text>
                </div>
              ))}
            </div>
            {/* 快捷回复 */}
            <div style={{ padding: '4px 12px', borderTop: '1px solid var(--ark-border-soft)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('请问发什么快递？多久能到？')}>📦 物流时效</Tag>
              <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('支持哪些支付方式？')}>💳 支付方式</Tag>
              <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('可以退换货吗？有什么条件？')}>🔄 退换政策</Tag>
              <Tag color="blue" style={{ cursor: 'pointer', fontSize: 10 }} onClick={() => setCsInput('这个商品有什么优惠活动吗？')}>🎁 优惠活动</Tag>
            </div>
            {/* 输入框 */}
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--ark-border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Input.TextArea
                placeholder={t('agent.csInputPlaceholder')}
                value={csInput}
                onChange={e => setCsInput(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ flex: 1, fontSize: 12 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    setCsInput('');
                    message.success('已发送（人工接管模式）');
                  }
                }}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={() => { setCsInput(''); message.success('已发送（人工接管模式）'); }} size="small">
                {t('common.send')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 广告投放：投放仪表盘弹窗 */}
      <Modal
        title={<><FundOutlined style={{ color: '#2563eb' }} /> {t('agent.adDashboard')}</>}
        open={adDashboardOpen}
        onCancel={() => setAdDashboardOpen(false)}
        footer={null}
        width={800}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
          最近 7 天投放效果总览 · 目标 ROI: 1.5× · 总花费: ${mockCampaigns.reduce((s, c) => s + c.spend, 0)}
        </Typography.Text>
        {mockCampaigns.map(c => (
          <Card
            key={c.id}
            size="small"
            hoverable
            style={{ marginBottom: 12, borderLeft: `4px solid ${c.roi >= 1.5 ? '#16a34a' : c.roi >= 1.0 ? '#ea580c' : '#dc2626'}` }}
            onClick={() => { setAdDashboardOpen(false); setAdOptimizeOpen(true); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <Typography.Text strong style={{ fontSize: 14 }}>{c.name}</Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>{c.id} · {c.status === 'active' ? '投放中' : '已暂停'}</Typography.Text>
              </div>
              <Space size={8}>
                <Tag color={c.roi >= 1.5 ? 'green' : c.roi >= 1.0 ? 'orange' : 'red'} style={{ fontSize: 11 }}>
                  ROI {c.roi}× {c.roi >= 1.5 ? '✓ 达标' : c.roi >= 1.0 ? '⚠ 偏低' : '✗ 不达标'}
                </Tag>
              </Space>
            </div>
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <div style={{ marginBottom: 4 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 10 }}>预算使用</Typography.Text>
                  <Typography.Text strong style={{ display: 'block', fontSize: 14 }}>${c.budget}</Typography.Text>
                </div>
                <Progress
                  percent={Math.round(c.spend / c.budget * 100)}
                  size="small"
                  status={c.roi < 1.0 ? 'exception' : c.roi >= 1.5 ? 'success' : 'active'}
                  format={() => `$${c.spend}`}
                />
              </Col>
              <Col span={4}>
                <Statistic title="ROI" value={c.roi} suffix="×" valueStyle={{ fontSize: 20, color: c.roi >= 1.5 ? '#16a34a' : c.roi >= 1.0 ? '#ea580c' : '#dc2626' }} />
              </Col>
              <Col span={4}>
                <Statistic title="曝光" value={(c.impressions / 1000).toFixed(1)} suffix="k" valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={4}>
                <Statistic title="点击" value={c.clicks} valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={4}>
                <Statistic title="CTR" value={(c.clicks / c.impressions * 100).toFixed(1)} suffix="%" valueStyle={{ fontSize: 14 }} />
              </Col>
              <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button size="small" type="link" icon={<ToolOutlined />} style={{ fontSize: 11, padding: 0 }}>
                  调整
                </Button>
              </Col>
            </Row>
          </Card>
        ))}
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <Button type="primary" icon={<ToolOutlined />} onClick={() => { setAdDashboardOpen(false); setAdOptimizeOpen(true); }}>
            {t('agent.adOptimize')}
          </Button>
        </div>
      </Modal>

      {/* 广告投放：预算优化弹窗 */}
      <Modal
        title={<><ToolOutlined /> {t('agent.adOptimize')}</>}
        open={adOptimizeOpen}
        onCancel={() => setAdOptimizeOpen(false)}
        onOk={() => { setAdOptimizeOpen(false); message.success('预算已重新分配！总预算 $1,200 → CA-001: $550, CA-002: $150, CA-003: $500'); }}
        okText={t('agent.adApply')}
        width={680}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          AI 分析了最近 7 天的投放数据，建议将低效计划 CA-002 的预算转移至高 ROI 计划 CA-001。
        </Typography.Paragraph>
        {mockBudgetSuggestions.map(s => (
          <Card key={s.campaignId} size="small" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text strong style={{ fontSize: 13 }}>{s.campaignId}</Typography.Text>
              <Tag color={s.suggested > s.current ? 'green' : s.suggested < s.current ? 'red' : 'default'} style={{ fontSize: 10 }}>
                {s.suggested > s.current ? '↑ 增加' : s.suggested < s.current ? '↓ 减少' : '→ 不变'}
              </Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>当前</Typography.Text>
                    <Typography.Text strong style={{ display: 'block', fontSize: 16, color: '#64748b' }}>${s.current}</Typography.Text>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>建议</Typography.Text>
                    <Typography.Text strong style={{ display: 'block', fontSize: 16, color: s.suggested > s.current ? '#16a34a' : s.suggested < s.current ? '#dc2626' : '#64748b' }}>
                      ${s.suggested}
                    </Typography.Text>
                  </Col>
                </Row>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, flex: 1, textAlign: 'right' }}>{s.reason}</Typography.Text>
            </div>
          </Card>
        ))}
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <Typography.Text style={{ fontSize: 12 }}>
            <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 4 }} />
            预计调整后整体 ROI 从 1.48× 提升至 1.72×，月利润增加约 $320
          </Typography.Text>
        </div>
      </Modal>

      {/* 素材工厂：图片生成预览弹窗 */}
      <Modal
        title={<><PictureOutlined style={{ color: '#7c3aed' }} /> 素材预览生成</>}
        open={creativeModalOpen}
        onCancel={() => setCreativeModalOpen(false)}
        footer={null}
        width={780}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
          基于商品信息和选定的尺寸/语气，AI 已生成 {mockCreatives.length} 组广告素材方案
        </Typography.Text>
        <Row gutter={[16, 16]}>
          {mockCreatives.map(creative => (
            <Col xs={24} sm={8} key={creative.id}>
              <Card
                hoverable
                size="small"
                style={{ textAlign: 'center', borderTop: `4px solid ${creative.colors[0]}` }}
              >
                {/* 模拟广告图预览 */}
                <div style={{
                  height: 140, margin: '-1px -1px 10px', borderRadius: '6px 6px 0 0',
                  background: `linear-gradient(135deg, ${creative.colors[0]} 0%, ${creative.colors[1]} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: creative.colors[2], fontSize: 18, fontWeight: 700, letterSpacing: 1,
                }}>
                  {creative.previewText}
                </div>
                <Typography.Text strong style={{ fontSize: 12, display: 'block' }}>{creative.product}</Typography.Text>
                <Space size={4} style={{ marginTop: 4 }}>
                  <Tag color="purple" style={{ fontSize: 9 }}>{creative.size}</Tag>
                  <Tag color="blue" style={{ fontSize: 9 }}>{creative.tone}</Tag>
                </Space>
                <Typography.Paragraph style={{ fontSize: 11, margin: '8px 0 0', color: '#64748b', whiteSpace: 'pre-line' }}>
                  {creative.copy}
                </Typography.Paragraph>
                <div style={{ marginTop: 8, display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <Button size="small" type="primary" ghost icon={<CheckCircleOutlined />} style={{ fontSize: 11 }}>
                    选用
                  </Button>
                  <Button size="small" icon={<ReloadOutlined />} style={{ fontSize: 11 }}>
                    换一版
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* 风险控制：违规扫描弹窗 */}
      <Modal
        title={<><SafetyOutlined style={{ color: '#dc2626' }} /> 合规扫描结果</>}
        open={riskModalOpen}
        onCancel={() => setRiskModalOpen(false)}
        footer={null}
        width={820}
      >
        <Tabs
          defaultActiveKey="scan"
          items={[
            {
              key: 'scan',
              label: `违规扫描 (${mockRiskScans.filter(r => r.status === 'pending').length})`,
              children: (
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  {mockRiskScans.map(scan => (
                    <Card
                      key={scan.id}
                      size="small"
                      style={{
                        marginBottom: 10,
                        borderLeft: `4px solid ${scan.severity === 'high' ? '#dc2626' : scan.severity === 'medium' ? '#ea580c' : '#f59e0b'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{scan.product}</Typography.Text>
                          <Tag
                            color={scan.severity === 'high' ? 'red' : scan.severity === 'medium' ? 'orange' : 'gold'}
                            style={{ marginLeft: 8, fontSize: 10 }}
                          >
                            {scan.severity === 'high' ? '高风险' : scan.severity === 'medium' ? '中风险' : '低风险'}
                          </Tag>
                        </div>
                        <Tag style={{ fontSize: 10 }}>{scan.rule}</Tag>
                      </div>
                      <Typography.Paragraph type="danger" style={{ fontSize: 12, margin: '0 0 6px', padding: '6px 10px', background: '#fef2f2', borderRadius: 6 }}>
                        {scan.issue}
                      </Typography.Paragraph>
                      <div style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '6px 10px', borderRadius: 6 }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        建议: {scan.suggestion}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            },
            {
              key: 'breaker',
              label: `熔断记录 (${mockBreakerLogs.length})`,
              children: (
                <div style={{ maxHeight: 420, overflow: 'auto' }}>
                  {mockBreakerLogs.map(log => (
                    <Card key={log.id} size="small" style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Typography.Text strong style={{ fontSize: 13 }}>{log.agent}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 10 }}>{log.time}</Typography.Text>
                      </div>
                      <Typography.Paragraph style={{ fontSize: 12, margin: '0 0 4px', padding: '6px 10px', background: '#fff7ed', borderRadius: 6, color: '#ea580c' }}>
                        {log.reason}
                      </Typography.Paragraph>
                      <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                        动作: {log.action}
                      </Typography.Text>
                      <Tag color={log.recovered ? 'green' : 'red'} style={{ fontSize: 10, marginTop: 4 }}>
                        {log.recovered ? `✓ 已恢复 · ${log.recoveredAt}` : '✗ 未恢复'}
                      </Tag>
                    </Card>
                  ))}
                </div>
              )
            }
          ]}
        />
      </Modal>

      {/* 直播运营：实时直播面板 */}
      <Modal
        title={<><PlayCircleOutlined style={{ color: '#ea580c', marginRight: 8 }} />{mockLiveMetrics.title}</>}
        open={liveModalOpen}
        onCancel={() => setLiveModalOpen(false)}
        footer={null}
        width={860}
      >
        <Row gutter={[16, 16]}>
          {/* 核心指标 */}
          <Col span={24}>
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ background: '#fef2f2', textAlign: 'center' }}>
                  <Statistic title="当前观看" value={mockLiveMetrics.viewers} valueStyle={{ fontSize: 22, color: '#dc2626' }} />
                  <Typography.Text type="secondary" style={{ fontSize: 10 }}>峰值 {mockLiveMetrics.peakViewers}</Typography.Text>
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="点赞" value={mockLiveMetrics.likes} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="评论" value={mockLiveMetrics.comments} valueStyle={{ fontSize: 20 }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="转化率" value={mockLiveMetrics.conversionRate} suffix="%" valueStyle={{ fontSize: 20, color: '#16a34a' }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ background: '#f0fdf4', textAlign: 'center' }}>
                  <Statistic title="GMV" value={mockLiveMetrics.gmv} prefix="$" valueStyle={{ fontSize: 20, color: '#16a34a' }} />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic title="时长" value={mockLiveMetrics.duration} valueStyle={{ fontSize: 16 }} />
                  <Tag color="green" style={{ fontSize: 9, marginTop: 2 }}>直播中</Tag>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* 商品列表 */}
          <Col xs={24} md={14}>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>讲解商品 (4)</Typography.Text>}>
              {mockLiveProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--ark-border-soft)' }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 12 }}>
                      {p.pinned && <PushpinOutlined style={{ color: '#ea580c', marginRight: 4, fontSize: 11 }} />}
                      {p.name}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>${p.price}</Typography.Text>
                  </div>
                  <Space size={8}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>点击 {p.clicks} · 成交 {p.orders}</Typography.Text>
                    {p.pinned ? (
                      <Tag color="orange" style={{ fontSize: 9 }}>已置顶</Tag>
                    ) : (
                      <Button size="small" type="link" style={{ fontSize: 10, padding: 0 }}>置顶</Button>
                    )}
                  </Space>
                </div>
              ))}
            </Card>
          </Col>

          {/* 评论区 */}
          <Col xs={24} md={10}>
            <Card size="small" title={<Typography.Text strong style={{ fontSize: 13 }}>评论区 ({mockLiveComments.length})</Typography.Text>} style={{ height: '100%' }}>
              {mockLiveComments.map(c => (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Typography.Text strong style={{ fontSize: 11 }}>{c.user}</Typography.Text>
                    {c.replied ? (
                      <Tag color="green" style={{ fontSize: 9, padding: '0 3px' }}>
                        <RobotOutlined /> AI已回
                      </Tag>
                    ) : (
                      <Tag color="orange" style={{ fontSize: 9, padding: '0 3px' }}>待回复</Tag>
                    )}
                  </div>
                  <Typography.Text style={{ fontSize: 11, display: 'block', padding: '4px 8px', background: '#eff6ff', borderRadius: 6 }}>
                    {c.text}
                  </Typography.Text>
                  {c.replied && c.aiReply && (
                    <Typography.Text style={{ fontSize: 10, color: '#16a34a', display: 'block', padding: '2px 8px', marginTop: 2 }}>
                      ↳ {c.aiReply}
                    </Typography.Text>
                  )}
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* CRM 复购：客户分层与运营弹窗 */}
      <Modal
        title={<><TeamOutlined style={{ color: '#2563eb' }} /> 客户分层与运营概览</>}
        open={crmModalOpen}
        onCancel={() => setCrmModalOpen(false)}
        footer={null}
        width={860}
      >
        <Tabs
          defaultActiveKey="segment"
          items={[
            {
              key: 'segment',
              label: '客户分层',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    {/* 环形图 */}
                    <Col xs={24} md={10} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{
                        width: 200, height: 200, borderRadius: '50%',
                        background: `conic-gradient(
                          #2563eb 0deg ${mockSegments.new.pct * 3.6}deg,
                          #16a34a ${mockSegments.new.pct * 3.6}deg ${(mockSegments.new.pct + mockSegments.active.pct) * 3.6}deg,
                          #ea580c ${(mockSegments.new.pct + mockSegments.active.pct) * 3.6}deg ${(mockSegments.new.pct + mockSegments.active.pct + mockSegments.dormant.pct) * 3.6}deg,
                          #dc2626 ${(mockSegments.new.pct + mockSegments.active.pct + mockSegments.dormant.pct) * 3.6}deg 360deg
                        )`,
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: 110, height: 110, borderRadius: '50%', background: '#fff',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Typography.Text strong style={{ fontSize: 22, color: '#2563eb' }}>
                            {Object.values(mockSegments).reduce((s, seg) => s + seg.count, 0)}
                          </Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 10 }}>总客户数</Typography.Text>
                        </div>
                      </div>
                    </Col>
                    {/* 分层指标 */}
                    <Col xs={24} md={14}>
                      {Object.entries(mockSegments).map(([key, seg]) => (
                        <div key={key} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Space size={6}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color }} />
                              <Typography.Text strong style={{ fontSize: 12 }}>{seg.label}</Typography.Text>
                              <Tag color="default" style={{ fontSize: 10 }}>{seg.pct}%</Tag>
                            </Space>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                              {seg.count} 人 · 均单 ${seg.avgOrderValue}
                            </Typography.Text>
                          </div>
                          <Progress
                            percent={seg.pct}
                            strokeColor={seg.color}
                            size="small"
                            format={() => `${seg.count}人`}
                          />
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: 'coupon',
              label: '优惠券方案',
              children: (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
                    AI 根据客户分层自动生成 {mockCoupons.length} 张定向优惠券，预计总成本 ${mockCoupons.reduce((s, c) => s + c.estimatedCost, 0)}
                  </Typography.Text>
                  {mockCoupons.map(coupon => (
                    <Card key={coupon.id} size="small" style={{ marginBottom: 10, borderLeft: '4px solid #7c3aed' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{coupon.name}</Typography.Text>
                          <div style={{ marginTop: 2 }}>
                            <Tag color="purple" style={{ fontSize: 9 }}>{coupon.type}</Tag>
                            <Tag color="blue" style={{ fontSize: 9 }}>
                              {coupon.target === 'new' ? '新客' : coupon.target === 'active' ? '活跃' : coupon.target === 'dormant' ? '沉睡' : '流失'}
                            </Tag>
                          </div>
                        </div>
                        <Typography.Text strong style={{ fontSize: 18, color: '#7c3aed' }}>{coupon.value}</Typography.Text>
                      </div>
                      <Row gutter={8} style={{ marginTop: 8 }}>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>最低消费</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{coupon.minOrder === 0 ? '无门槛' : `$${coupon.minOrder}`}</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>有效期</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{coupon.expiryDays} 天</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>目标人数</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{mockSegments[coupon.target as keyof typeof mockSegments].count} 人</Typography.Text>
                        </Col>
                        <Col span={6}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>预估成本</Typography.Text>
                          <Typography.Text style={{ fontSize: 11, color: '#ea580c' }}>${coupon.estimatedCost}</Typography.Text>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                        <Button size="small" type="primary" ghost style={{ fontSize: 10 }}>一键发放</Button>
                        <Button size="small" style={{ fontSize: 10 }}>编辑规则</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            },
            {
              key: 'churn',
              label: `流失预警 (${mockChurnRisks.length})`,
              children: (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  {mockChurnRisks.map(risk => (
                    <Card
                      key={risk.id}
                      size="small"
                      style={{
                        marginBottom: 10,
                        borderLeft: `4px solid ${risk.risk >= 70 ? '#dc2626' : risk.risk >= 50 ? '#ea580c' : '#f59e0b'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Typography.Text strong style={{ fontSize: 13 }}>{risk.name}</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                            {risk.segment === 'dormant' ? '沉睡客户' : risk.segment === 'active' ? '活跃客户' : '新客'}
                          </Typography.Text>
                        </div>
                        <Tag color={risk.risk >= 70 ? 'red' : risk.risk >= 50 ? 'orange' : 'gold'} style={{ fontSize: 10 }}>
                          流失风险 {risk.risk}%
                        </Tag>
                      </div>
                      <Row gutter={8} style={{ marginTop: 6 }}>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>最后购买</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{risk.lastPurchase}</Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>累计消费</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>${risk.totalSpent}</Typography.Text>
                        </Col>
                        <Col span={8}>
                          <Typography.Text type="secondary" style={{ fontSize: 10, display: 'block' }}>历史订单</Typography.Text>
                          <Typography.Text style={{ fontSize: 11 }}>{risk.orders} 单</Typography.Text>
                        </Col>
                      </Row>
                      <div style={{ marginTop: 6, padding: '6px 10px', background: '#fff7ed', borderRadius: 6 }}>
                        <Typography.Text type="warning" style={{ fontSize: 11 }}>
                          <WarningOutlined style={{ marginRight: 4, fontSize: 10 }} />
                          {risk.reason}
                        </Typography.Text>
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                        <Button size="small" type="primary" ghost style={{ fontSize: 10 }}>发送挽留券</Button>
                        <Button size="small" style={{ fontSize: 10 }}>查看详情</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
}
