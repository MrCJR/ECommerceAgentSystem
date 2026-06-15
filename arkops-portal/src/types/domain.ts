export type StoreStatus = 'pending_login' | 'connected' | 'login_required' | 'expired' | 'revoked';
export type StoreAuthMethod = 'credentials' | 'api_key' | 'oauth';
export type StoreServiceType = 'store_backend' | 'advertising' | 'customer_service' | 'logistics' | 'finance' | 'other';
export type TaskStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'waiting_approval'
  | 'succeeded'
  | 'failed'
  | 'canceled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface StoreConnection {
  id: string;
  serviceName: string;
  serviceType: StoreServiceType;
  authMethod: StoreAuthMethod;
  status: StoreStatus;
  apiKey?: string;
  apiSecret?: string;
  account?: string;
  runtimeProvider: 'mulerun' | 'direct';
  runtimeSessionId?: string;
  lastVerifiedAt?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  platform: string;
  status: StoreStatus;
  authMethod: StoreAuthMethod;
  runtimeProvider: 'mulerun';
  runtimeSessionId?: string;
  apiKey?: string;
  apiSecret?: string;
  oauthProvider?: string;
  account?: string;
  region?: string;
  currency?: string;
  lastVerifiedAt?: string;
  createdAt: string;
  recentTaskIds: string[];
  connections: StoreConnection[];
}

export interface TimelineEvent {
  id: string;
  type:
    | 'run_started'
    | 'step_started'
    | 'step_completed'
    | 'approval_required'
    | 'login_required'
    | 'run_succeeded'
    | 'run_failed';
  title: string;
  summary: string;
  at: string;
  artifactUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  storeId: string;
  agentType: AgentType;
  goal: string;
  status: TaskStatus;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface Approval {
  id: string;
  taskId: string;
  storeId: string;
  title: string;
  reason: string;
  proposedAction: string;
  beforeValue: string;
  afterValue: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Operator' | 'Approver' | 'Viewer';
  status: 'active' | 'invited';
}

// ===== Agent Management =====

export type AgentTriggerMode = 'manual' | 'scheduled' | 'event';

export interface AgentConfig {
  agentType: AgentType;
  displayName: string;
  description: string;
  icon: string;
  riskLevel: RiskLevel;
  triggerMode: AgentTriggerMode;
  cronExpression?: string;
  eventTrigger?: string;
  executionParams: { key: string; label: string; defaultValue: string }[];
  riskGuard: {
    maxBudgetPerAction: number;
    actionWhitelist: string[];
    actionBlacklist: string[];
  };
  approvalStrategy: {
    requireApproval: boolean;
    approverRole: string;
    requireSecondApproval: boolean;
  };
  modelBinding: {
    provider: string;
    model: string;
  };
  retryPolicy: {
    maxRetries: number;
    retryIntervalMinutes: number;
  };
  timeoutMinutes: number;
  enabled: boolean;
}

export interface AgentRunStats {
  totalRuns: number;
  successRate: number;
  avgDurationMinutes: number;
  avgTokenUsage: number;
  avgCost: number;
  trend: { date: string; runs: number; successRate: number }[];
  failureReasons: { reason: string; count: number }[];
}

export type AgentType = 'login_bootstrap' | 'ads_optimizer' | 'product_launch' | 'crm_retention' | 'finance_audit';

// ===== Store Config =====

export interface StoreConfig {
  storeId: string;
  riskThresholds: {
    maxBudgetAdjustment: number;
    highRiskActions: string[];
  };
  operationWindow: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  autoReconnect: {
    enabled: boolean;
    retryAfterMinutes: number;
    maxRetries: number;
  };
  approvalRules: {
    useIndependentApprover: boolean;
    approverMemberId?: string;
    enableSecondApproval: boolean;
  };
}

// ===== Approval Policy =====

export interface ApprovalPolicy {
  id: string;
  riskLevel: RiskLevel;
  action: 'auto_execute' | 'single_approval' | 'dual_approval';
  approverType: 'role' | 'specific';
  approverRole?: string;
  approverMemberId?: string;
  timeoutHours: number;
  timeoutAction: 'auto_reject' | 'auto_approve' | 'escalate';
  storeSpecificRules: { storeId: string; riskLevel: RiskLevel; action: string }[];
}

// ===== Business Dashboard Metrics =====

export interface BusinessMetrics {
  gmv: { today: number; yesterday: number; lastWeekSameDay: number };
  orders: { today: number; yesterday: number; lastWeekSameDay: number };
  aov: number;
  storeCount: { online: number; total: number };
  gmvTrend: { date: string; gmv: number; orders: number }[];
  storeGmvRank: { storeName: string; gmv: number; platform: string }[];
  adMetrics: {
    todaySpend: number;
    roas: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cvr: number;
    budgetLimit: number;
    targetRoas: number;
    trend: { date: string; spend: number; gmv: number }[];
    lowPerformingPlans: { name: string; spend: number; roi: number }[];
  };
  afterSales: {
    returnRate: number;
    returnAmount: number;
    negativeReviews: number;
    respondedReviews: number;
    reviewResponseRate: number;
    storeRating: number;
    disputes: { pending: number; processing: number };
    avgResponseMinutes: number;
    reviewTrend: { date: string; returnRate: number; negativeCount: number }[];
  };
  inventory: {
    totalSkus: number;
    lowStockCount: number;
    slowMovingCount: number;
    outOfStockCount: number;
  };
}

// ===== Finance =====

export interface SubscriptionPlan {
  tier: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  storeLimit: number;
  agentConcurrency: number;
  monthlyOps: number;
  tokenQuota: number;
  price: number;
  currency: string;
}

export interface BillingDetail {
  baseSubscription: number;
  overageItems: { description: string; amount: number; currency: string }[];
  discount: number;
  total: number;
  currency: string;
}

export interface BillingRecord {
  id: string;
  period: string;
  status: 'pending' | 'paid' | 'overdue';
  amount: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  invoiceUrl?: string;
}

export interface CostAnalysis {
  byStore: { storeName: string; agentCalls: number; tokenCost: number }[];
  byAgent: { agentType: string; calls: number; cost: number }[];
  estimatedSaving: { manualCostPerOp: number; automatedOps: number; savedAmount: number };
  recommendation: string;
}

// ===== Model Management =====

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  apiKey?: string;
  active: boolean;
}

export interface ModelUsageStats {
  modelId: string;
  modelName: string;
  totalCalls: number;
  totalTokens: number;
  trend: { date: string; calls: number }[];
}

export interface AgentModelBinding {
  agentType: AgentType;
  agentDisplayName: string;
  boundModelId: string;
  boundModelName: string;
}

// ===== Store Business Detail =====

export interface StoreBusinessDetail {
  storeId: string;
  storeName: string;
  gmv: { today: number; yesterday: number; trend: { date: string; value: number }[] };
  orders: { today: number; yesterday: number; trend: { date: string; value: number }[] };
  aov: number;
  adMetrics: {
    todaySpend: number;
    roas: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cvr: number;
    budgetLimit: number;
    trend: { date: string; spend: number; gmv: number }[];
    campaigns: { name: string; spend: number; roi: number; status: string }[];
  };
  afterSales: {
    returnRate: number;
    returnAmount: number;
    negativeReviews: number;
    unresolvedReviews: number;
    storeRating: number;
    disputes: { pending: number; processing: number };
  };
  inventory: {
    totalSkus: number;
    lowStockCount: number;
    slowMovingCount: number;
    outOfStockCount: number;
    lowStockItems: { sku: string; name: string; stock: number; safetyStock: number }[];
  };
  topProducts: { name: string; gmv: number; orders: number; sku: string }[];
}
