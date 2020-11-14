import { ScopedStorage, StorageType } from "../";

export class FallbackStorage<T> implements ScopedStorage<T> {
  public readonly type = StorageType.NONE;
  constructor(private readonly _key: string, private readonly _storage: Map<string, any>) {}
  get(): T | undefined {
    return this._storage.get(this._key) as T | undefined;
  }
  set(value: T): void {
    this._storage.set(this._key, value);
  }
  delete(): void {
    this._storage.delete(this._key);
  }
}
