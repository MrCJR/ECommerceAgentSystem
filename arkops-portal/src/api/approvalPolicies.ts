import { mockDelay } from './client';
import type { ApprovalPolicy } from '../types/domain';

const policies: ApprovalPolicy[] = [
  {
    id: 'policy_001',
    riskLevel: 'low',
    action: 'auto_execute',
    approverType: 'role',
    timeoutHours: 24,
    timeoutAction: 'auto_approve',
    storeSpecificRules: []
  },
  {
    id: 'policy_002',
    riskLevel: 'medium',
    action: 'single_approval',
    approverType: 'role',
    approverRole: 'Approver',
    timeoutHours: 24,
    timeoutAction: 'auto_reject',
    storeSpecificRules: []
  },
  {
    id: 'policy_003',
    riskLevel: 'high',
    action: 'dual_approval',
    approverType: 'role',
    approverRole: 'Approver',
    timeoutHours: 12,
    timeoutAction: 'escalate',
    storeSpecificRules: []
  }
];

export const approvalPolicyApi = {
  list: (): Promise<ApprovalPolicy[]> => mockDelay([...policies]),
  get: (id: string): Promise<ApprovalPolicy | undefined> => mockDelay(policies.find((p) => p.id === id)),
  create: (input: Partial<ApprovalPolicy>): Promise<ApprovalPolicy> => {
    const policy: ApprovalPolicy = {
      id: `policy_${String(policies.length + 1).padStart(3, '0')}`,
      riskLevel: input.riskLevel ?? 'low',
      action: input.action ?? 'single_approval',
      approverType: input.approverType ?? 'role',
      approverRole: input.approverRole,
      approverMemberId: input.approverMemberId,
      timeoutHours: input.timeoutHours ?? 24,
      timeoutAction: input.timeoutAction ?? 'auto_reject',
      storeSpecificRules: input.storeSpecificRules ?? []
    };
    policies.push(policy);
    return mockDelay(policy);
  },
  update: (id: string, input: Partial<ApprovalPolicy>): Promise<ApprovalPolicy | undefined> => {
    const idx = policies.findIndex((p) => p.id === id);
    if (idx !== -1) {
      policies[idx] = { ...policies[idx], ...input };
      return mockDelay(policies[idx]);
    }
    return mockDelay(undefined);
  }
};
