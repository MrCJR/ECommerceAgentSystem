import { mockDelay } from './client';
import { approvals } from './mockData';
import { replaceItem } from './mockRepository';
import type { AllMallId, ApprovalStatus } from '../types/domain';

export const approvalsApi = {
  list: () => mockDelay([...approvals]),
  get: (approvalId: AllMallId) => mockDelay(approvals.find((approval) => approval.id === approvalId)),
  decide: (approvalId: AllMallId, status: Extract<ApprovalStatus, 'approved' | 'rejected'>) => {
    const approval = replaceItem(approvals, (item) => item.id === approvalId, (item) => ({
      ...item,
      status,
      decidedAt: new Date().toISOString()
    }));
    return mockDelay(approval);
  }
};
