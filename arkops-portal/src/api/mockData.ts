import dayjs from 'dayjs';
import type { Approval, AuditLog, Member, Store, Task } from '../types/domain';

const now = dayjs('2026-05-30T10:00:00+08:00');

export const stores: Store[] = [
  {
    id: 'store_001',
    name: 'TikTok Shop US Flagship',
    platform: 'tiktok_shop',
    status: 'connected',
    runtimeProvider: 'mulerun',
    runtimeSessionId: 'mr_session_tts_001',
    lastVerifiedAt: now.subtract(2, 'hour').toISOString(),
    createdAt: now.subtract(5, 'day').toISOString(),
    recentTaskIds: ['task_001', 'task_002']
  },
  {
    id: 'store_002',
    name: 'Amazon Outdoor Store',
    platform: 'amazon',
    status: 'login_required',
    runtimeProvider: 'mulerun',
    runtimeSessionId: 'mr_session_amz_002',
    lastVerifiedAt: now.subtract(2, 'day').toISOString(),
    createdAt: now.subtract(9, 'day').toISOString(),
    recentTaskIds: ['task_003']
  },
  {
    id: 'store_003',
    name: 'Shopify DTC Site',
    platform: 'shopify',
    status: 'pending_login',
    runtimeProvider: 'mulerun',
    createdAt: now.subtract(1, 'day').toISOString(),
    recentTaskIds: []
  }
];

export const tasks: Task[] = [
  {
    id: 'task_001',
    title: 'Reduce wasteful ad spend',
    storeId: 'store_001',
    agentType: 'ads_optimizer',
    goal: 'Find low-ROI campaigns and propose budget changes.',
    status: 'waiting_approval',
    riskLevel: 'high',
    createdAt: now.subtract(90, 'minute').toISOString(),
    updatedAt: now.subtract(12, 'minute').toISOString(),
    timeline: [
      {
        id: 'evt_001',
        type: 'run_started',
        title: 'Run started',
        summary: 'MuleRun loaded the bound TikTok Shop browser profile.',
        at: now.subtract(90, 'minute').toISOString()
      },
      {
        id: 'evt_002',
        type: 'step_completed',
        title: 'Campaign ROI analyzed',
        summary: 'Found 3 campaigns below target ROI for the last 7 days.',
        at: now.subtract(40, 'minute').toISOString(),
        artifactUrl: 's3://arkops-artifacts/task_001/roi-dashboard.png'
      },
      {
        id: 'evt_003',
        type: 'approval_required',
        title: 'Approval required',
        summary: 'Pausing campaign C-102 exceeds tenant risk threshold.',
        at: now.subtract(12, 'minute').toISOString()
      }
    ]
  },
  {
    id: 'task_002',
    title: 'Launch new camping product',
    storeId: 'store_001',
    agentType: 'product_launch',
    goal: 'Generate SEO title and prepare product listing draft.',
    status: 'succeeded',
    riskLevel: 'medium',
    createdAt: now.subtract(1, 'day').toISOString(),
    updatedAt: now.subtract(23, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_004',
        type: 'run_started',
        title: 'Run started',
        summary: 'Product launch SOP started.',
        at: now.subtract(1, 'day').toISOString()
      },
      {
        id: 'evt_005',
        type: 'run_succeeded',
        title: 'Listing draft completed',
        summary: 'Generated title, attributes, and detail-page outline.',
        at: now.subtract(23, 'hour').toISOString()
      }
    ]
  },
  {
    id: 'task_003',
    title: 'Re-authenticate Amazon store',
    storeId: 'store_002',
    agentType: 'login_bootstrap',
    goal: 'Ask operator to refresh marketplace session.',
    status: 'failed',
    riskLevel: 'low',
    createdAt: now.subtract(6, 'hour').toISOString(),
    updatedAt: now.subtract(5, 'hour').toISOString(),
    timeline: [
      {
        id: 'evt_006',
        type: 'login_required',
        title: 'Login required',
        summary: 'Amazon seller center requested a new human verification step.',
        at: now.subtract(5, 'hour').toISOString()
      },
      {
        id: 'evt_007',
        type: 'run_failed',
        title: 'Run stopped',
        summary: 'Automation stopped until the operator refreshes the session.',
        at: now.subtract(5, 'hour').toISOString()
      }
    ]
  }
];

export const approvals: Approval[] = [
  {
    id: 'approval_001',
    taskId: 'task_001',
    storeId: 'store_001',
    title: 'Pause low-ROI TikTok campaign',
    reason: 'Campaign C-102 has spent $612 with ROI 42% below target.',
    proposedAction: 'Pause campaign C-102 and shift 15% budget to campaign C-088.',
    beforeValue: 'Campaign C-102 daily budget: $420',
    afterValue: 'Campaign C-102 paused; C-088 daily budget: +$63',
    riskLevel: 'high',
    status: 'pending',
    requestedAt: now.subtract(12, 'minute').toISOString()
  },
  {
    id: 'approval_002',
    taskId: 'task_002',
    storeId: 'store_001',
    title: 'Approve generated product claims',
    reason: 'Agent generated benefit statements for a new listing.',
    proposedAction: 'Publish listing draft after compliance review.',
    beforeValue: 'Listing status: draft',
    afterValue: 'Listing status: ready for publish',
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
    action: 'approval_required',
    entity: 'task',
    entityId: 'task_001',
    summary: 'Budget action exceeded tenant threshold.',
    at: now.subtract(12, 'minute').toISOString()
  },
  {
    id: 'audit_002',
    actor: 'Li Peng',
    action: 'store_connected',
    entity: 'store',
    entityId: 'store_001',
    summary: 'TikTok Shop session bound through connectToken.',
    at: now.subtract(5, 'day').toISOString()
  },
  {
    id: 'audit_003',
    actor: 'ArkOps System',
    action: 'login_required',
    entity: 'store',
    entityId: 'store_002',
    summary: 'Amazon store session expired.',
    at: now.subtract(5, 'hour').toISOString()
  }
];

export const members: Member[] = [
  { id: 'mem_001', name: 'Li Peng', email: 'lipeng@example.com', role: 'Owner', status: 'active' },
  { id: 'mem_002', name: 'Ops Lead', email: 'ops@example.com', role: 'Admin', status: 'active' },
  { id: 'mem_003', name: 'Approver', email: 'risk@example.com', role: 'Approver', status: 'invited' }
];
