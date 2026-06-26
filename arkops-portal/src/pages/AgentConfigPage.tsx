import { BankOutlined, BellOutlined, CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, CustomerServiceOutlined, DollarOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, FireOutlined, GiftOutlined, GlobalOutlined, KeyOutlined, LineChartOutlined, PictureOutlined, PlusOutlined, RadarChartOutlined, ReloadOutlined, SafetyOutlined, SearchOutlined, SettingOutlined, ShoppingCartOutlined, SkinOutlined, SmileOutlined, StarOutlined, StopOutlined, ThunderboltOutlined, ToolOutlined, UnorderedListOutlined, WalletOutlined, WarningOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
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
import type { AgentConfig, AgentType, Task, TaskStatus } from '../types/domain';

export function AgentConfigPage() {
  const { t } = useI18n();
  const { agentType } = useParams<{ agentType: AgentType }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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
    }
  });

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
  const hasBuiltinTasks = isLoginBootstrap || isCompetitorIntel || isProductLaunch || isAdsOptimizer || isPricingStrategy || isCrmRetention || isReviewManager || isCustomerService || isAfterSales || isCreativeFactory || isInventoryAlert || isRiskControl || isFinanceAudit;

  const activeStatuses: TaskStatus[] = ['draft', 'queued', 'running', 'waiting_approval'];
  const logStatuses: TaskStatus[] = ['succeeded', 'failed', 'cancelled'];
  const activeTasks = tasks.filter((t) => activeStatuses.includes(t.status));
  const logTasks = tasks.filter((t) => logStatuses.includes(t.status));

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
          {agent.executionParams.length > 0 && (
            <Descriptions.Item label={t('agent.defaultParams')}>
              {agent.executionParams.map((p) => (
                <Tag key={p.key}>{p.label}: {p.defaultValue}</Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

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
        </Card>
      )}

      {/* 店铺保活：内置任务卡片 */}
      {isLoginBootstrap && (
        <Card
          title={<><UnorderedListOutlined /> {t('agent.builtinTasks')}</>}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
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
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <Typography.Text strong style={{ fontSize: 13 }}>
                      <CameraOutlined style={{ color: '#2563eb', marginRight: 6 }} />
                      {t('agent.imageRecognition')}
                    </Typography.Text>
                    <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                      {t('agent.imageRecognitionDesc')}
                    </Typography.Paragraph>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color="orange">{t('agent.active')}</Tag>
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)} style={{ marginLeft: 'auto' }}>{t('agent.newTask')}</Button>
                </div>
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
                <Tag color="green" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* CRM 复购：内置任务卡片 */}
      {isCrmRetention && (
        <Card title={<><GiftOutlined /> {t('agent.builtinTasks')}</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
                <Typography.Text strong style={{ fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#ea580c', marginRight: 6 }} />
                  {t('agent.churnPredict')}
                </Typography.Text>
                <Typography.Paragraph type="secondary" style={{ fontSize: 11, margin: '4px 0 0', paddingLeft: 22 }}>
                  {t('agent.churnPredictDesc')}
                </Typography.Paragraph>
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
                <Tag color="blue" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
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
                <Tag color="default" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="red" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.passive')}</Tag>
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
                <Tag color="orange" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.auto')}</Tag>
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

      {/* 运行中任务 */}
      {!isLoginBootstrap && activeTasks.length > 0 && (
        <Card
          title={<><UnorderedListOutlined /> {t('agent.activeTasks')} ({activeTasks.length})</>}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
              {t('agent.newTask')}
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            rowKey="id"
            dataSource={activeTasks}
            pagination={false}
            size="small"
            columns={[
              { title: t('entity.task'), dataIndex: 'title', render: (title: string) => <Typography.Text strong>{title}</Typography.Text> },
              { title: t('agent.taskGoal'), dataIndex: 'goal', render: (goal: string) => <Typography.Text type="secondary" style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal}</Typography.Text> },
              { title: t('stores.status'), dataIndex: 'status', width: 120, render: (status: TaskStatus) => <StatusBadge value={status} /> },
              { title: t('stores.createdAt'), dataIndex: 'createdAt', width: 140, render: (v: string) => new Date(v).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              {
                title: t('common.actions'), width: 80,
                render: (_: unknown, record: Task) => (
                  <Button
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    loading={cancelTaskMutation.isPending}
                    onClick={() => cancelTaskMutation.mutate(record.id)}
                  >
                    {t('common.cancel')}
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* 新建任务按钮（无运行中任务时单独显示，店铺保活除外） */}
      {!isLoginBootstrap && activeTasks.length === 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Typography.Paragraph type="secondary">{t('agent.noActiveTasks')}</Typography.Paragraph>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalOpen(true)}>
              {t('agent.newTask')}
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
      </Modal>
    </div>
  );
}
