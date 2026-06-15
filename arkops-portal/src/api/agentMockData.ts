import type { AgentConfig, AgentRunStats } from '../types/domain';

export const agentConfigs: AgentConfig[] = [
  {
    agentType: 'ads_optimizer',
    displayName: '广告优化 Agent',
    description: '分析广告 ROI，自动调整预算、暂停低效广告计划。',
    icon: 'ads',
    riskLevel: 'high',
    triggerMode: 'scheduled',
    cronExpression: '0 */6 * * *',
    executionParams: [
      { key: 'targetROI', label: '目标 ROI', defaultValue: '2.0' },
      { key: 'lookbackDays', label: '分析天数', defaultValue: '7' },
      { key: 'maxBudgetPerPlan', label: '单计划日预算上限（美元）', defaultValue: '500' }
    ],
    riskGuard: {
      maxBudgetPerAction: 200,
      actionWhitelist: ['adjust_budget', 'pause_campaign'],
      actionBlacklist: ['delete_campaign', 'create_campaign']
    },
    approvalStrategy: {
      requireApproval: true,
      approverRole: 'Approver',
      requireSecondApproval: false
    },
    modelBinding: {
      provider: 'OpenAI',
      model: 'gpt-4o'
    },
    retryPolicy: {
      maxRetries: 2,
      retryIntervalMinutes: 5
    },
    timeoutMinutes: 30,
    enabled: true
  },
  {
    agentType: 'product_launch',
    displayName: '新品上架 Agent',
    description: '生成 SEO 标题、卖点文案、详情页草稿并完成上架。',
    icon: 'product',
    riskLevel: 'medium',
    triggerMode: 'manual',
    executionParams: [
      { key: 'category', label: '商品类目', defaultValue: '' },
      { key: 'keywords', label: 'SEO 关键词（逗号分隔）', defaultValue: '' },
      { key: 'targetMarket', label: '目标市场', defaultValue: 'US' }
    ],
    riskGuard: {
      maxBudgetPerAction: 0,
      actionWhitelist: ['create_draft', 'publish_product'],
      actionBlacklist: []
    },
    approvalStrategy: {
      requireApproval: true,
      approverRole: 'Operator',
      requireSecondApproval: false
    },
    modelBinding: {
      provider: 'Anthropic',
      model: 'claude-sonnet-4-20250514'
    },
    retryPolicy: {
      maxRetries: 1,
      retryIntervalMinutes: 3
    },
    timeoutMinutes: 20,
    enabled: true
  },
  {
    agentType: 'crm_retention',
    displayName: 'CRM 复购 Agent',
    description: '分析客户数据，生成复购营销策略和触达方案。',
    icon: 'crm',
    riskLevel: 'medium',
    triggerMode: 'scheduled',
    cronExpression: '0 0 * * 1',
    executionParams: [
      { key: 'segmentSize', label: '客户分群粒度', defaultValue: '3' },
      { key: 'discountCap', label: '最高折扣比例（%）', defaultValue: '20' }
    ],
    riskGuard: {
      maxBudgetPerAction: 100,
      actionWhitelist: ['send_coupon', 'send_email'],
      actionBlacklist: []
    },
    approvalStrategy: {
      requireApproval: false,
      approverRole: '',
      requireSecondApproval: false
    },
    modelBinding: {
      provider: 'DeepSeek',
      model: 'deepseek-chat'
    },
    retryPolicy: {
      maxRetries: 2,
      retryIntervalMinutes: 10
    },
    timeoutMinutes: 25,
    enabled: false
  },
  {
    agentType: 'login_bootstrap',
    displayName: '登录引导 Agent',
    description: '检测店铺掉线，引导运营重新完成登录。',
    icon: 'login',
    riskLevel: 'low',
    triggerMode: 'event',
    eventTrigger: 'store_session_expired',
    executionParams: [
      { key: 'notifyChannels', label: '通知渠道', defaultValue: 'feishu,email' }
    ],
    riskGuard: {
      maxBudgetPerAction: 0,
      actionWhitelist: ['notify_operator', 'create_session'],
      actionBlacklist: []
    },
    approvalStrategy: {
      requireApproval: false,
      approverRole: '',
      requireSecondApproval: false
    },
    modelBinding: {
      provider: 'DeepSeek',
      model: 'deepseek-chat'
    },
    retryPolicy: {
      maxRetries: 3,
      retryIntervalMinutes: 2
    },
    timeoutMinutes: 10,
    enabled: true
  },
  {
    agentType: 'finance_audit',
    displayName: '财务对账 Agent',
    description: '自动拉取平台账单，标记差异，生成对账报告。',
    icon: 'finance',
    riskLevel: 'medium',
    triggerMode: 'scheduled',
    cronExpression: '0 0 1 * *',
    executionParams: [
      { key: 'reconciliationPeriod', label: '对账周期（天）', defaultValue: '30' }
    ],
    riskGuard: {
      maxBudgetPerAction: 0,
      actionWhitelist: ['fetch_billing', 'generate_report'],
      actionBlacklist: ['adjust_settlement']
    },
    approvalStrategy: {
      requireApproval: true,
      approverRole: 'Owner',
      requireSecondApproval: false
    },
    modelBinding: {
      provider: 'OpenAI',
      model: 'gpt-4o'
    },
    retryPolicy: {
      maxRetries: 1,
      retryIntervalMinutes: 5
    },
    timeoutMinutes: 45,
    enabled: false
  }
];

export const agentRunStatsMap: Record<string, AgentRunStats> = {
  ads_optimizer: {
    totalRuns: 142,
    successRate: 88.7,
    avgDurationMinutes: 18,
    avgTokenUsage: 12400,
    avgCost: 0.42,
    trend: [
      { date: 'Mon', runs: 22, successRate: 91 },
      { date: 'Tue', runs: 28, successRate: 89 },
      { date: 'Wed', runs: 25, successRate: 88 },
      { date: 'Thu', runs: 30, successRate: 90 },
      { date: 'Fri', runs: 24, successRate: 85 },
      { date: 'Sat', runs: 10, successRate: 88 },
      { date: 'Sun', runs: 3, successRate: 86 }
    ],
    failureReasons: [
      { reason: '审批超时', count: 5 },
      { reason: '店铺掉线', count: 4 },
      { reason: '广告 API 限制', count: 3 }
    ]
  },
  product_launch: {
    totalRuns: 87,
    successRate: 94.3,
    avgDurationMinutes: 12,
    avgTokenUsage: 8600,
    avgCost: 0.18,
    trend: [
      { date: 'Mon', runs: 14, successRate: 93 },
      { date: 'Tue', runs: 18, successRate: 95 },
      { date: 'Wed', runs: 15, successRate: 94 },
      { date: 'Thu', runs: 20, successRate: 96 },
      { date: 'Fri', runs: 12, successRate: 92 },
      { date: 'Sat', runs: 6, successRate: 95 },
      { date: 'Sun', runs: 2, successRate: 90 }
    ],
    failureReasons: [
      { reason: '内容审核不通过', count: 3 },
      { reason: '图片处理失败', count: 2 }
    ]
  },
  crm_retention: {
    totalRuns: 56,
    successRate: 91.1,
    avgDurationMinutes: 15,
    avgTokenUsage: 7200,
    avgCost: 0.08,
    trend: [
      { date: 'Mon', runs: 12, successRate: 92 },
      { date: 'Tue', runs: 14, successRate: 90 },
      { date: 'Wed', runs: 10, successRate: 91 },
      { date: 'Thu', runs: 8, successRate: 93 },
      { date: 'Fri', runs: 7, successRate: 89 },
      { date: 'Sat', runs: 3, successRate: 91 },
      { date: 'Sun', runs: 2, successRate: 88 }
    ],
    failureReasons: [
      { reason: '客户数据不完整', count: 3 },
      { reason: '邮件发送失败', count: 2 }
    ]
  },
  login_bootstrap: {
    totalRuns: 203,
    successRate: 76.8,
    avgDurationMinutes: 5,
    avgTokenUsage: 1800,
    avgCost: 0.02,
    trend: [
      { date: 'Mon', runs: 32, successRate: 78 },
      { date: 'Tue', runs: 45, successRate: 75 },
      { date: 'Wed', runs: 38, successRate: 77 },
      { date: 'Thu', runs: 41, successRate: 79 },
      { date: 'Fri', runs: 28, successRate: 74 },
      { date: 'Sat', runs: 12, successRate: 76 },
      { date: 'Sun', runs: 7, successRate: 73 }
    ],
    failureReasons: [
      { reason: '人机校验超时', count: 28 },
      { reason: '运营未响应', count: 15 },
      { reason: '浏览器 Profile 失效', count: 4 }
    ]
  },
  finance_audit: {
    totalRuns: 24,
    successRate: 95.8,
    avgDurationMinutes: 22,
    avgTokenUsage: 15600,
    avgCost: 0.35,
    trend: [
      { date: 'Mon', runs: 5, successRate: 96 },
      { date: 'Tue', runs: 6, successRate: 95 },
      { date: 'Wed', runs: 4, successRate: 96 },
      { date: 'Thu', runs: 3, successRate: 97 },
      { date: 'Fri', runs: 3, successRate: 95 },
      { date: 'Sat', runs: 2, successRate: 94 },
      { date: 'Sun', runs: 1, successRate: 93 }
    ],
    failureReasons: [
      { reason: '平台账单 API 超时', count: 1 }
    ]
  }
};
