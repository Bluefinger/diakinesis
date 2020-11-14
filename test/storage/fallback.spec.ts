import { expect } from "chai";
import { StorageType } from "../../src";
import { FallbackStorage } from "../../src/storage/storages";

describe("Fallback Storage", () => {
  it("constructs itself from a Map object", () => {
    const storage = new FallbackStorage("key", new Map<string, unknown>());
    expect(storage.type).to.equal(StorageType.NONE);
  });
  it("exposes a Map-like API for storing/getting/deleting data scoped to a key to/from the storage", () => {
    const storage = new FallbackStorage("key", new Map<string, unknown>());
    storage.set(12);
    expect(storage.get()).to.equal(12);
    storage.delete();
    expect(storage.get()).to.be.undefined;
  });
});
