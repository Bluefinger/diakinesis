import type { BrowserStorage, ScopedStorage } from "../";

export class WrappedStorage<T> implements ScopedStorage<T> {
  constructor(
    public readonly type: BrowserStorage,
    private readonly _key: string,
    private readonly _storage: Storage
  ) {}
  get(): T | undefined {
    const result = this._storage.getItem(this._key);
    if (result !== null) {
      return JSON.parse(result) as T;
    }
  }
  set(value: T): void {
    this._storage.setItem(this._key, JSON.stringify(value));
  }
  delete(): void {
    this._storage.removeItem(this._key);
  }
}
