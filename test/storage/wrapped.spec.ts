import { expect } from "chai";
import { StorageType } from "../../src";
import { WrappedStorage } from "../../src/storage/storages";

describe("Wrapped Storage", () => {
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
  it("constructs itself from a Browser Storage object", () => {
    const wrapped = new WrappedStorage(StorageType.LOCAL, "key", storage as Storage);
    expect(wrapped.type).to.equal(StorageType.LOCAL);
  });
  it("exposes a Map-like API for storing/getting/deleting data scoped to a key to/from the storage", () => {
    const wrapped = new WrappedStorage(StorageType.LOCAL, "key", storage as Storage);
    wrapped.set(12);
    expect(wrapped.get()).to.equal(12);
    wrapped.delete();
    expect(wrapped.get()).to.be.undefined;
  });
});
