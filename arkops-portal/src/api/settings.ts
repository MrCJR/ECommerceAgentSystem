import { mockDelay } from './client';
import { members } from './mockData';

export const settingsApi = {
  members: () => mockDelay([...members]),
  notifications: () =>
    mockDelay([
      { channel: 'Feishu', status: 'connected', events: 'approval_required, login_required' },
      { channel: 'DingTalk', status: 'not_configured', events: 'none' },
      { channel: 'Webhook', status: 'connected', events: 'all runtime events' }
    ]),
  billing: () =>
    mockDelay({
      plan: 'Internal Beta',
      workerLimit: 5,
      browserSessionLimit: 12,
      tokenUsage: 184200,
      operationUsage: 392
    })
};
