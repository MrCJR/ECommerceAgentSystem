import { mockDelay } from './client';
import { auditLogs } from './mockData';

export const auditLogsApi = {
  list: () => mockDelay([...auditLogs])
};
