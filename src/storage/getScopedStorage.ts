import { StorageType, ScopedStorage } from "./types";
import { testStorage, testGlobalScope } from "./helpers";
import { FallbackStorage } from "./storages";

let fallback: Map<string, any> | undefined;

export const getScopedStorage = <T extends unknown>(
  type: StorageType,
  key: string,
  globalScope?: Window
): ScopedStorage<T> => {
  const scope = testGlobalScope(globalScope);
  let storage: ScopedStorage<T> | undefined;
  switch (type) {
    case StorageType.LOCAL:
      storage = testStorage(StorageType.LOCAL, key, scope);
      if (storage) break;
    // fallthrough
    case StorageType.SESSION:
      storage = testStorage(StorageType.SESSION, key, scope);
      if (storage) break;
    // fallthrough
    default:
      // Lazy-load fallback storage. No need to initialise it until it is specifically needed
      storage = new FallbackStorage(key, (fallback ??= new Map<string, any>()));
  }
  return storage;
};
