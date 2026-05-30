export type StoreStatus = 'pending_login' | 'connected' | 'login_required' | 'expired' | 'revoked';
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

export interface Store {
  id: string;
  name: string;
  platform: string;
  status: StoreStatus;
  runtimeProvider: 'mulerun';
  runtimeSessionId?: string;
  lastVerifiedAt?: string;
  createdAt: string;
  recentTaskIds: string[];
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
  agentType: 'login_bootstrap' | 'ads_optimizer' | 'product_launch' | 'crm_retention' | 'finance_audit';
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
