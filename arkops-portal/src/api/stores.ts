import { makeConnectToken, mockDelay } from './client';
import { stores, tasks } from './mockData';
import type { Store } from '../types/domain';

export const storesApi = {
  list: () => mockDelay([...stores]),
  get: (storeId: string) => mockDelay(stores.find((store) => store.id === storeId)),
  recentTasks: (storeId: string) => mockDelay(tasks.filter((task) => task.storeId === storeId)),
  createConnectToken: (storeId: string) =>
    mockDelay({
      storeId,
      connectToken: makeConnectToken(storeId),
      expiresInMinutes: 30
    }),
  create: (input: Pick<Store, 'name' | 'platform'>) => {
    const store: Store = {
      id: `store_${String(stores.length + 1).padStart(3, '0')}`,
      name: input.name,
      platform: input.platform,
      status: 'pending_login',
      runtimeProvider: 'mulerun',
      createdAt: new Date().toISOString(),
      recentTaskIds: []
    };
    stores.unshift(store);
    return mockDelay(store);
  },
  updateStatus: (storeId: string, status: Store['status']) => {
    const store = stores.find((item) => item.id === storeId);
    if (store) store.status = status;
    return mockDelay(store);
  }
};
