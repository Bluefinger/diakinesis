import { expect } from "chai";
import { getScopedStorage, StorageType } from "../../src";

describe("getScopedStorage", () => {
  const store = new Map<string, unknown>();
  const storage: unknown = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: unknown) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  const scope: unknown = {
    localStorage: storage,
    sessionStorage: storage,
  };
  it("returns a wrapped LocalStorage instance", () => {
    const wrapped = getScopedStorage(StorageType.LOCAL, "key", scope as Window);
    expect(wrapped.type).to.equal(StorageType.LOCAL);
  });
  it("returns a wrapped SessionStorage instance", () => {
    const wrapped = getScopedStorage(StorageType.SESSION, "key", scope as Window);
    expect(wrapped.type).to.equal(StorageType.SESSION);
  });
  it("returns a wrapped FallbackStorage instance", () => {
    const wrapped = getScopedStorage(StorageType.NONE, "key", scope as Window);
    expect(wrapped.type).to.equal(StorageType.NONE);
  });
  it("falls back to a wrapped FallbackStorage instance if other storages fail to initialise", () => {
    const failScope = {};
    const wrapped1 = getScopedStorage(StorageType.LOCAL, "key", failScope as Window);
    expect(wrapped1.type).to.equal(StorageType.NONE);
    const wrapped2 = getScopedStorage(StorageType.SESSION, "key", failScope as Window);
    expect(wrapped2.type).to.equal(StorageType.NONE);
  });
});
