export function insertFirst<T>(items: T[], item: T) {
  items.splice(0, 0, item);
  return item;
}

export function appendItem<T>(items: T[], item: T) {
  items.push(item);
  return item;
}

export function replaceItem<T>(items: T[], predicate: (item: T) => boolean, nextValue: T | ((current: T) => T)) {
  const index = items.findIndex(predicate);
  if (index === -1) return undefined;
  const next = typeof nextValue === 'function' ? (nextValue as (current: T) => T)(items[index]) : nextValue;
  items.splice(index, 1, next);
  return next;
}

export function removeWhere<T>(items: T[], predicate: (item: T) => boolean) {
  items.splice(0, items.length, ...items.filter((item) => !predicate(item)));
}
