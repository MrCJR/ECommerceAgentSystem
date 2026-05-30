import { mockDelay } from './client';
import { approvals } from './mockData';
import type { ApprovalStatus } from '../types/domain';

export const approvalsApi = {
  list: () => mockDelay([...approvals]),
  get: (approvalId: string) => mockDelay(approvals.find((approval) => approval.id === approvalId)),
  decide: (approvalId: string, status: Extract<ApprovalStatus, 'approved' | 'rejected'>) => {
    const approval = approvals.find((item) => item.id === approvalId);
    if (approval) {
      approval.status = status;
      approval.decidedAt = new Date().toISOString();
    }
    return mockDelay(approval);
  }
};
