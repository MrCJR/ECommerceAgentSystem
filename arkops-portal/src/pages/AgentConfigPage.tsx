import { BankOutlined, BellOutlined, CameraOutlined, CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, CustomerServiceOutlined, DollarOutlined, EditOutlined, EyeOutlined, FileSearchOutlined, FireOutlined, GiftOutlined, GlobalOutlined, KeyOutlined, LineChartOutlined, PictureOutlined, PlusOutlined, PushpinOutlined, RadarChartOutlined, ReloadOutlined, SafetyOutlined, SearchOutlined, SettingOutlined, ShoppingCartOutlined, SkinOutlined, SmileOutlined, StarOutlined, StopOutlined, ThunderboltOutlined, ToolOutlined, UnorderedListOutlined, WalletOutlined, WarningOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
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
import type { AgentConfig, AgentType, Task, TaskStatus } from '../types/domain';

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
  const [recognitionResult, setRecognitionResult] = useState<{
    productName: string;
    category: string;
    attributes: string;
    seoTitle: string;
    description: string;
    sellingPoints: string;
    suggestedPrice: number;
  } | null>(null);

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
    // Simulate AI recognition delay, rotate through mock variants
    const variants = [
      {
        productName: '65W GaN 氮化镓快充充电器',
        category: '消费电子 > 充电器 > GaN 快速充电器',
        attributes: '颜色: 黑色, 接口: USB-C ×2 + USB-A ×1, 功率: 65W, 协议: PD 3.0/QC 4.0/PPS, 重量: 128g',
        seoTitle: '65W GaN Fast Charger USB-C PD 3.0 Compatible iPhone Samsung MacBook Compact Travel Charger',
        description: '【65W 大功率三接口】支持同时为笔记本、平板和手机充电。氮化镓技术体积缩小 50%，折叠插脚便于携带。\n【广泛兼容】支持 PD 3.0 / QC 4.0 / PPS 协议，兼容 iPhone 15/14/13、Samsung Galaxy S24、MacBook Air、iPad Pro 等主流设备。\n【安全可靠】内置过压/过流/过热/短路多重保护，通过 CE/FCC/RoHS 认证。',
        sellingPoints: '65W 大功率，笔记本也能充\n氮化镓 GaN 技术，体积缩小50%\n三口同时输出，一个顶三个\n智能温控，充电不发烫\n全球通用电压 100-240V',
        suggestedPrice: 39.99
      },
      {
        productName: '夏季速干运动T恤 男女同款',
        category: '运动户外 > 运动服饰 > 运动T恤',
        attributes: '材质: 涤纶+氨纶, 版型: 修身, 颜色: 黑/白/灰, 尺码: S-3XL, 速干等级: 4级',
        seoTitle: 'Quick Dry Athletic T-Shirt Men Women Gym Workout Running Sports Tee Breathable Lightweight',
        description: '【4级速干科技】采用蜂窝导汗结构面料，出汗后 5 分钟速干，运动全程干爽不贴身。\n【四面弹力】高弹力氨纶混纺，深蹲、跑步、力量训练不受束缚。\n【轻量透气】单件仅 180g，背部激光透气孔设计，夏天穿着不闷热。',
        sellingPoints: '蜂窝导汗，5分钟速干\n四面弹力，运动无束缚\n仅 180g，穿着如无物\nS-3XL 全尺码覆盖\n机洗不变形，不掉色',
        suggestedPrice: 24.99
      },
      {
        productName: '可折叠露营椅 承重150kg',
        category: '运动户外 > 露营装备 > 折叠桌椅',
        attributes: '材质: 600D牛津布+铝合金骨架, 承重: 150kg, 重量: 1.2kg, 折叠尺寸: 35×12cm, 颜色: 军绿/卡其',
        seoTitle: 'Portable Folding Camping Chair 150kg Capacity Lightweight 1.2kg Oxford Fabric Compact Travel Outdoor',
        description: '【150kg 超强承重】加厚铝合金骨架 + 600D 加密牛津布，稳固耐用，大体重也安心。\n【一手掌握】折叠后仅 35×12cm，仅 1.2kg，单手可拎，背包侧袋也能塞。\n【3 秒快开】免安装，展开即坐，收起即走。露营、钓鱼、排队、户外演出通通适用。',
        sellingPoints: '承重 150kg，大体重也安心\n折叠后仅 35×12cm\n仅 1.2kg，一手掌握\n3秒快开，免安装\n600D牛津布，防泼水耐磨',
        suggestedPrice: 35.99
      }
    ];
    const idx = Math.floor(Math.random() * variants.length);
    setTimeout(() => {
      setRecognizing(false);
      setRecognitionResult(variants[idx]);
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

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  if (!agent) return <Typography.Text type="danger">{t('agent.notFound')}</Typography.Text>;

  const depsMissing = agent.dependsOn.filter((d) => !allAgents.find((a) => a.agentType === d)?.enabled);
  const switchDisabled = agent.required || depsMissing.length > 0;
  const riskControlOn = allAgents.find((a) => a.agentType === 'risk_control')?.enabled === true;
  const isGuarded = riskControlOn && agent.agentType !== 'risk_control' && agent.agentType !== 'finance_audit';

  // 商品草稿预览 mock 数据（按任务 ID 映射）
  const productDrafts: Record<string, {
    productName: string; category: string; platform: string;
    skus: { spec: string; price: number; stock: number; skuCode: string }[];
    costPrice: number; sellingPrice: number;
    totalStock: number; weight: string; dimensions: string; shippingFrom: string;
    genericAttrs: { label: string; value: string }[];
    categoryAttrs: { label: string; value: string }[];
    mainImages: number; skuImages: number; detailImages: number; hasVideo: boolean;
    seoTitle: string; description: string; sellingPoints: string[];
  }> = {
    'task_009': {
      productName: '65W GaN 氮化镓快充充电器',
      category: '消费电子 > 充电器 > GaN 快速充电器', platform: 'TikTok Shop',
      skus: [
        { spec: '黑色/USB-C ×2+USB-A', price: 39.99, stock: 520, skuCode: 'GN65-BK-001' },
        { spec: '白色/USB-C ×2+USB-A', price: 39.99, stock: 380, skuCode: 'GN65-WH-001' },
      ],
      costPrice: 18.50, sellingPrice: 39.99,
      totalStock: 900, weight: '128g/件（含包装 180g）', dimensions: '5.5×5.2×3.0 cm', shippingFrom: '深圳仓（CN）',
      genericAttrs: [
        { label: '品牌', value: 'GaNPower' }, { label: '型号', value: 'GN65-Pro' },
        { label: '接口类型', value: 'USB-C ×2, USB-A ×1' }, { label: '最大功率', value: '65W' },
        { label: '输入电压', value: 'AC 100-240V 50/60Hz' }, { label: '材质', value: 'PC 阻燃外壳' },
      ],
      categoryAttrs: [
        { label: '快充协议', value: 'PD 3.0 / QC 4.0 / PPS / AFC / FCP' },
        { label: '氮化镓', value: '是（GaN 第三代）' }, { label: '折叠插脚', value: '是' },
      ],
      mainImages: 6, skuImages: 2, detailImages: 8, hasVideo: true,
      seoTitle: '65W GaN Fast Charger USB-C PD 3.0 Compatible iPhone Samsung MacBook Compact Travel Charger',
      description: '【65W 大功率三接口】支持同时为笔记本、平板和手机充电。氮化镓技术体积缩小 50%，折叠插脚便于携带。',
      sellingPoints: ['65W 大功率，笔记本也能充', '氮化镓 GaN 技术，体积缩小50%', '三口同时输出，一个顶三个', '智能温控，充电不发烫', '全球通用电压 100-240V'],
    },
    'task_010': {
      productName: '夏季速干运动T恤 男女同款',
      category: '运动户外 > 运动服饰 > 运动T恤', platform: 'Amazon',
      skus: [
        { spec: '黑色/S', price: 24.99, stock: 200, skuCode: 'SDT-BK-S' },
        { spec: '黑色/M', price: 24.99, stock: 350, skuCode: 'SDT-BK-M' },
        { spec: '黑色/L', price: 24.99, stock: 300, skuCode: 'SDT-BK-L' },
        { spec: '白色/M', price: 24.99, stock: 280, skuCode: 'SDT-WH-M' },
      ],
      costPrice: 8.20, sellingPrice: 24.99,
      totalStock: 1130, weight: '180g/件', dimensions: '包装：30×22×2 cm', shippingFrom: '广州仓（CN）→ Amazon FBA US',
      genericAttrs: [
        { label: '材质', value: '88%涤纶 + 12%氨纶' }, { label: '版型', value: '修身' },
        { label: '领型', value: '圆领' }, { label: '袖长', value: '短袖' },
        { label: '适用季节', value: '春夏秋三季' },
      ],
      categoryAttrs: [
        { label: '速干等级', value: '4级（5分钟内速干）' }, { label: '透气性', value: '背部激光透气孔' },
        { label: '防晒指数', value: 'UPF 50+' }, { label: '弹性', value: '四面弹力' },
      ],
      mainImages: 8, skuImages: 4, detailImages: 10, hasVideo: true,
      seoTitle: 'Quick Dry Athletic T-Shirt Men Women Gym Workout Running Sports Tee Breathable Lightweight',
      description: '【4级速干科技】采用蜂窝导汗结构面料，出汗后 5 分钟速干，运动全程干爽不贴身。',
      sellingPoints: ['蜂窝导汗，5分钟速干', '四面弹力，运动无束缚', '仅 180g，穿着如无物', 'S-3XL 全尺码覆盖', '机洗不变形，不掉色'],
    },
    'task_011': {
      productName: '蓝牙耳机 Pro 第二代',
      category: '消费电子 > 音频 > 真无线耳机', platform: 'TikTok Shop',
      skus: [
        { spec: '曜石黑', price: 49.99, stock: 600, skuCode: 'BTP2-BK' },
        { spec: '珍珠白', price: 49.99, stock: 450, skuCode: 'BTP2-WH' },
        { spec: '星辰蓝', price: 54.99, stock: 300, skuCode: 'BTP2-BL' },
      ],
      costPrice: 22.00, sellingPrice: 49.99,
      totalStock: 1350, weight: '52g/对（含充电仓 58g）', dimensions: '充电仓：6.0×4.5×2.8 cm', shippingFrom: '深圳仓（CN）',
      genericAttrs: [
        { label: '品牌', value: 'SoundFlow' }, { label: '型号', value: 'Pro 2nd Gen' },
        { label: '蓝牙版本', value: '5.3' }, { label: '续航', value: '8h（+充电仓 32h）' },
        { label: '防水等级', value: 'IPX5' },
      ],
      categoryAttrs: [
        { label: '降噪', value: 'ANC 主动降噪（-35dB）' }, { label: '驱动单元', value: '13mm 动圈' },
        { label: '延迟', value: '游戏模式 45ms' }, { label: '编解码', value: 'AAC/SBC' },
      ],
      mainImages: 7, skuImages: 3, detailImages: 9, hasVideo: true,
      seoTitle: 'Bluetooth 5.3 Wireless Earbuds ANC Active Noise Cancelling 8H Playtime IPX5 Sports Earphones',
      description: '【ANC 主动降噪】-35dB 深度降噪，通勤/学习/办公一键静享。通透模式无需摘下耳机即可感知环境音。',
      sellingPoints: ['ANC主动降噪 -35dB', '蓝牙5.3，开盖即连', '8h续航+32h充电仓', 'IPX5防水防汗', '游戏模式45ms低延迟'],
    },
  };

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
                <Tag color="purple" style={{ marginTop: 8, marginLeft: 22 }}>{t('agent.scheduled')}</Tag>
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
              <Card size="small" style={{ background: 'var(--ark-panel-soft)', height: '100%' }}>
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
    </div>
  );
}
