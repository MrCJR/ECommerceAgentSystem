import dayjs from 'dayjs';
import type { Approval, AuditLog, Member, Store, StoreConnection, Task } from '../types/domain';

const now = dayjs('2026-05-30T10:00:00+08:00');

export const stores: Store[] = [
  {
    id: 'store_001',
    name: 'TikTok Shop 美国旗舰店',
    platform: 'tiktok_shop',
    status: 'connected',
    authMethod: 'credentials',
    runtimeProvider: 'mulerun',
    runtimeSessionId: 'mr_session_tts_001',
    region: 'US',
    currency: 'USD',
    lastVerifiedAt: now.subtract(2, 'hour').toISOString(),
    createdAt: now.subtract(5, 'day').toISOString(),
    recentTaskIds: ['task_001', 'task_002'],
    connections: [
      {
        id: 'conn_001',
        serviceName: 'TikTok 广告管理平台',
        serviceType: 'advertising',
        authMethod: 'credentials',
        status: 'connected',
        account: 'seller@tiktokshop.com',
        runtimeProvider: 'mulerun',
        runtimeSessionId: 'mr_session_tts_001_ads',
        lastVerifiedAt: now.subtract(3, 'hour').toISOString(),
        createdAt: now.subtract(5, 'day').toISOString()
      }
    ]
  },
  {
    id: 'store_002',
    name: 'Amazon 户外用品店',
    platform: 'amazon',
    status: 'login_required',
    authMethod: 'credentials',
    runtimeProvider: 'mulerun',
    runtimeSessionId: 'mr_session_amz_002',
    account: 'seller@outdoor-gear.com',
    region: 'US',
    currency: 'USD',
    lastVerifiedAt: now.subtract(2, 'day').toISOString(),
    createdAt: now.subtract(9, 'day').toISOString(),
    recentTaskIds: ['task_003'],
    connections: [
      {
        id: 'conn_003',
        serviceName: 'Amazon 广告后台',
        serviceType: 'advertising',
        authMethod: 'credentials',
        status: 'connected',
        account: 'seller@outdoor-gear.com',
        runtimeProvider: 'mulerun',
        runtimeSessionId: 'mr_session_amz_002_ads',
        lastVerifiedAt: now.subtract(1, 'day').toISOString(),
        createdAt: now.subtract(9, 'day').toISOString()
      },
      {
        id: 'conn_004',
        serviceName: 'Amazon 客服消息',
        serviceType: 'customer_service',
        authMethod: 'credentials',
        status: 'login_required',
        account: 'seller@outdoor-gear.com',
        runtimeProvider: 'mulerun',
        runtimeSessionId: 'mr_session_amz_002_cs',
        lastVerifiedAt: now.subtract(3, 'day').toISOString(),
        createdAt: now.subtract(8, 'day').toISOString()
      }
    ]
  },
  {
    id: 'store_003',
    name: 'Shopify 独立站',
    platform: 'shopify',
    status: 'pending_login',
    authMethod: 'api_key',
    runtimeProvider: 'mulerun',
    apiKey: 'shpat_xxxxxxxxxxxx',
    region: 'US',
    currency: 'USD',
    createdAt: now.subtract(1, 'day').toISOString(),
    recentTaskIds: [],
    connections: []
  }
];

export const tasks: Task[] = [
  {
    id: 'task_001',
    title: '降低低效广告消耗',
    storeId: 'store_001',
    agentType: 'ads_optimizer',
    goal: '识别低 ROI 广告计划，并提出预算调整建议。',
    status: 'waiting_approval',
    riskLevel: 'high',
    createdAt: now.subtract(90, 'minute').toISOString(),
    updatedAt: now.subtract(12, 'minute').toISOString(),
    timeline: [
      {
        id: 'evt_001',
        type: 'run_started',
        title: '任务开始执行',
        summary: 'MuleRun 已加载绑定的 TikTok Shop 浏览器 Profile。',
        at: now.subtract(90, 'minute').toISOString()
      },
      {
        id: 'evt_002',
        type: 'step_completed',
        title: '广告 ROI 分析完成',
        summary: '近 7 天内发现 3 个广告计划低于目标 ROI。',
        at: now.subtract(40, 'minute').toISOString(),
        artifactUrl: 's3://allmall-artifacts/task_001/roi-dashboard.png'
      },
      {
        id: 'evt_003',
        type: 'approval_required',
        title: '需要人工审批',
        summary: '暂停广告计划 C-102 超过租户风险阈值，需要审批确认。',
        at: now.subtract(12, 'minute').toISOString()
      }
    ]
  },
  {
    id: 'task_002',
    title: '上架新品露营装备',
    storeId: 'store_001',
    agentType: 'product_launch',
    goal: '生成 SEO 标题，并准备商品上架草稿。',
    status: 'succeeded',
    riskLevel: 'medium',
    createdAt: now.subtract(1, 'day').toISOString(),
    updatedAt: now.subtract(23, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_004',
        type: 'run_started',
        title: '新品上架 SOP 开始',
        summary: 'Agent 已开始执行新品上架流程。',
        at: now.subtract(1, 'day').toISOString()
      },
      {
        id: 'evt_005',
        type: 'run_succeeded',
        title: '商品草稿已完成',
        summary: '已生成标题、属性和详情页结构。',
        at: now.subtract(23, 'hour').toISOString()
      }
    ]
  },
  {
    id: 'task_003',
    title: '重新认证 Amazon 店铺',
    storeId: 'store_002',
    agentType: 'login_bootstrap',
    goal: '提醒运营人员刷新平台登录会话。',
    status: 'failed',
    riskLevel: 'low',
    createdAt: now.subtract(6, 'hour').toISOString(),
    updatedAt: now.subtract(5, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_006',
        type: 'login_required',
        title: '需要重新登录',
        summary: 'Amazon 卖家中心要求重新进行人机校验。',
        at: now.subtract(5, 'hour').toISOString()
      },
      {
        id: 'evt_007',
        type: 'run_failed',
        title: '任务已停止',
        summary: '自动化已暂停，等待运营人员刷新登录会话。',
        at: now.subtract(5, 'hour').toISOString()
      }
    ]
  },
  {
    id: 'task_004',
    title: 'TikTok Shop 店铺会话检测',
    storeId: 'store_001',
    agentType: 'login_bootstrap',
    goal: '定时检测店铺登录态，如果掉线则自动拉起登录流程。',
    status: 'running',
    riskLevel: 'low',
    createdAt: now.subtract(1, 'hour').toISOString(),
    updatedAt: now.subtract(30, 'minute').toISOString(),
    timeline: [
      {
        id: 'evt_c01',
        type: 'run_started',
        title: '开始会话检测',
        summary: '对 TikTok Shop 美国旗舰店发起登录态检测。',
        at: now.subtract(1, 'hour').toISOString()
      },
      {
        id: 'evt_c02',
        type: 'step_completed',
        title: '会话状态正常',
        summary: 'TikTok Shop 店铺登录态有效，无需重新登录。',
        at: now.subtract(30, 'minute').toISOString()
      }
    ]
  },
  {
    id: 'task_005',
    title: '竞品被动监控',
    storeId: 'store_001',
    agentType: 'competitor_intel',
    goal: '监控 TikTok Shop 同类蓝牙耳机竞品价格和 SEO 关键词变化。',
    status: 'succeeded',
    riskLevel: 'low',
    createdAt: now.subtract(3, 'hour').toISOString(),
    updatedAt: now.subtract(2, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_c03',
        type: 'run_started',
        title: '竞品数据采集开始',
        summary: '对 5 个竞品店铺发起价格和 SEO 关键词抓取。',
        at: now.subtract(3, 'hour').toISOString()
      },
      {
        id: 'evt_c04',
        type: 'step_completed',
        title: '竞品数据采集完成',
        summary: '发现 2 个竞品降价，3 个竞品更新了 SEO 关键词。',
        at: now.subtract(2.5, 'hour').toISOString()
      },
      {
        id: 'evt_c05',
        type: 'run_succeeded',
        title: '监控完成',
        summary: '部分数据已写入市场情报缓存，供其他 Agent 调度。',
        at: now.subtract(2, 'hour').toISOString()
      }
    ]
  },
  {
    id: 'task_006',
    title: '行业趋势监控',
    storeId: 'store_001',
    agentType: 'competitor_intel',
    goal: '扫描消费电子类目热词和季节性趋势。',
    status: 'running',
    riskLevel: 'low',
    createdAt: now.subtract(30, 'minute').toISOString(),
    updatedAt: now.subtract(10, 'minute').toISOString(),
    timeline: [
      {
        id: 'evt_c06',
        type: 'run_started',
        title: '趋势分析开始',
        summary: '对消费电子类目发起热词扫描和消费者画像更新。',
        at: now.subtract(30, 'minute').toISOString()
      },
      {
        id: 'evt_c07',
        type: 'step_completed',
        title: '类目热词分析完成',
        summary: '提取 Top 20 热搜词，发现 3 个上升趋势词。',
        at: now.subtract(10, 'minute').toISOString()
      }
    ]
  },
  {
    id: 'task_007',
    title: '商品调研 - 智能手表',
    storeId: 'store_001',
    agentType: 'competitor_intel',
    goal: '调研智能手表类目市场容量、竞品定价区间、消费者画像。',
    status: 'succeeded',
    riskLevel: 'low',
    createdAt: now.subtract(1, 'day').toISOString(),
    updatedAt: now.subtract(23, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_c08',
        type: 'run_started',
        title: '商品调研开始',
        summary: '对智能手表类目发起市场容量和竞品定价调研。',
        at: now.subtract(1, 'day').toISOString()
      },
      {
        id: 'evt_c09',
        type: 'run_succeeded',
        title: '调研完成',
        summary: '市场容量约 2.3 亿美元/年，竞品定价区间 $25-$80，推荐定价 $45-$55。',
        at: now.subtract(23, 'hour').toISOString()
      }
    ]
  },
  {
    id: 'task_008',
    title: '竞品被动监控',
    storeId: 'store_002',
    agentType: 'competitor_intel',
    goal: '监控 Amazon 户外用品竞品促销活动。',
    status: 'failed',
    riskLevel: 'low',
    createdAt: now.subtract(4, 'hour').toISOString(),
    updatedAt: now.subtract(3.5, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_c10',
        type: 'run_started',
        title: '竞品促销监控开始',
        summary: '对 Amazon 户外用品类目 Top 10 竞品发起促销监控。',
        at: now.subtract(4, 'hour').toISOString()
      },
      {
        id: 'evt_c11',
        type: 'run_failed',
        title: '部分数据抓取失败',
        summary: '2 个竞品页面返回 403，疑似反爬限制。已自动重试仍失败。',
        at: now.subtract(3.5, 'hour').toISOString()
      }
    ]
  }
];

export const approvals: Approval[] = [
  {
    id: 'approval_001',
    taskId: 'task_001',
    storeId: 'store_001',
    storeName: 'TikTok Shop 美国旗舰店',
    agentType: 'ads_optimizer',
    title: '暂停低 ROI TikTok 广告计划',
    reason: '广告计划 C-102 已消耗 612 美元，ROI 低于目标值 42%。',
    proposedAction: '暂停广告计划 C-102，并将 15% 预算转移到广告计划 C-088。',
    beforeValue: '广告计划 C-102 日预算：420 美元',
    afterValue: '广告计划 C-102 暂停；C-088 日预算增加 63 美元',
    riskLevel: 'high',
    status: 'pending',
    requestedAt: now.subtract(12, 'minute').toISOString()
  },
  {
    id: 'approval_002',
    taskId: 'task_002',
    storeId: 'store_001',
    storeName: 'TikTok Shop 美国旗舰店',
    agentType: 'product_launch',
    title: '审核新品卖点文案',
    reason: 'Agent 为新品详情页生成了卖点描述。',
    proposedAction: '合规审核通过后，将商品草稿标记为可发布。',
    beforeValue: '商品状态：草稿',
    afterValue: '商品状态：待发布',
    riskLevel: 'medium',
    status: 'approved',
    requestedAt: now.subtract(1, 'day').toISOString(),
    decidedAt: now.subtract(23, 'hour').toISOString()
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: 'audit_001',
    actor: 'MuleRun Agent',
    action: '需要审批',
    entity: '任务',
    entityId: 'task_001',
    summary: '预算调整动作超过租户阈值。',
    at: now.subtract(12, 'minute').toISOString()
  },
  {
    id: 'audit_002',
    actor: '李鹏',
    action: '店铺已连接',
    entity: '店铺',
    entityId: 'store_001',
    summary: 'TikTok Shop 通过 connectToken 完成会话绑定。',
    at: now.subtract(5, 'day').toISOString()
  },
  {
    id: 'audit_003',
    actor: 'AllMall 系统',
    action: '需要重新登录',
    entity: '店铺',
    entityId: 'store_002',
    summary: 'Amazon 店铺会话已失效。',
    at: now.subtract(5, 'hour').toISOString()
  }
];

export const members: Member[] = [
  { id: 'mem_001', name: '李鹏', email: 'lipeng@example.com', role: 'Owner', status: 'active' },
  { id: 'mem_002', name: '运营负责人', email: 'ops@example.com', role: 'Admin', status: 'active' },
  { id: 'mem_003', name: '风控审批人', email: 'risk@example.com', role: 'Approver', status: 'invited' }
];
