import { mockDelay } from './client';
import { members } from './mockData';

export const settingsApi = {
  members: () => mockDelay([...members]),
  notifications: () =>
    mockDelay([
      { channel: '飞书', status: 'connected', events: '需要审批、需要重新登录' },
      { channel: '钉钉', status: 'not_configured', events: '未配置' },
      { channel: 'Webhook', status: 'connected', events: '所有 runtime 事件' }
    ]),
  billing: () =>
    mockDelay({
      plan: '内部测试版',
      workerLimit: 5,
      browserSessionLimit: 12,
      tokenUsage: 184200,
      operationUsage: 392
    })
};
