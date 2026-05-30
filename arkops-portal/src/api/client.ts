export function mockDelay<T>(value: T, delay = 180): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

export function makeConnectToken(storeId: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `arkops_connect_${storeId}_${suffix}`;
}
