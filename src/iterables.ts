export function* map<T, U = T>(iter: Iterable<T>, fn: (value: T) => U): Generator<U> {
  for (const value of iter) {
    yield fn(value);
  }
}

export function reduce<T, U = T>(acc: U, iter: Iterable<T>, fn: (acc: U, val: T) => U): U {
  for (const value of iter) acc = fn(acc, value);
  return acc;
}

export function* uniqueMap<T, U = T>(iter: Iterable<T>, fn: (item: T) => U): Generator<U> {
  const values = new Set<T>();
  for (const value of iter) {
    if (values.has(value)) continue;
    values.add(value);
    yield fn(value);
  }
}

export function* filter<T>(iter: Iterable<T>, fn: (value: T) => boolean): Generator<T> {
  for (const value of iter) {
    if (!fn(value)) continue;
    yield value;
  }
}

const isGenerator = <T>(value: T | IterableIterator<T>): value is Generator<T> =>
  (value as Generator<T>)[Symbol.iterator] !== undefined;

export function* flatten<T>(iter: Iterable<T | IterableIterator<T>>): Generator<T> {
  for (const value of iter) {
    if (isGenerator(value)) yield* value;
    else yield value as T;
  }
}
