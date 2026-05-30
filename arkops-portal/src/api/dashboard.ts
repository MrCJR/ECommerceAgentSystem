import { mockDelay } from './client';
import { approvals, stores, tasks } from './mockData';

export const dashboardApi = {
  getSummary: () =>
    mockDelay({
      connectedStores: stores.filter((store) => store.status === 'connected').length,
      runningTasks: tasks.filter((task) => task.status === 'running' || task.status === 'queued').length,
      pendingApprovals: approvals.filter((approval) => approval.status === 'pending').length,
      loginRequiredStores: stores.filter((store) => store.status === 'login_required').length,
      recentTasks: tasks.slice(0, 5),
      recentApprovals: approvals.slice(0, 5)
    })
};
