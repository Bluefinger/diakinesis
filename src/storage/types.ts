export const enum StorageType {
  NONE = "noStorage",
  SESSION = "sessionStorage",
  LOCAL = "localStorage",
}

export type BrowserStorage = StorageType.LOCAL | StorageType.SESSION;

export interface ScopedStorage<T extends unknown> {
  readonly type: StorageType;
  get(): T | undefined;
  set(value: T): void;
  delete(): void;
}
