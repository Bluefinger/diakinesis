import { expect } from "chai";
import { StorageType } from "../../src";
import { testGlobalScope, testStorage } from "../../src/storage/helpers";

describe("storage helpers", () => {
  describe("testGlobalScope", () => {
    it("checks for the existence of the global window object provides a fallback", () => {
      const scope = testGlobalScope();
      expect(scope).to.deep.equal({});
    });
    it("passes a scope object if one is passed as a parameter", () => {
      const globalScope = {};
      const scope = testGlobalScope(globalScope as any);
      expect(scope).to.equal(globalScope);
    });
  });
  describe("testStorage", () => {
    it("always returns undefined if it fails the test process once", () => {
      const scope: unknown = {};
      const storage = testStorage(StorageType.LOCAL, "key", scope as any);
      expect(storage).to.be.undefined;
      const storage2 = testStorage(StorageType.LOCAL, "key", scope as any);
      expect(storage2).to.be.undefined;
    });
    it("returns a WrappedStorage instance if the test process passes", () => {
      const store = new Map<string, unknown>();
      const scope = {
        [StorageType.SESSION]: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: unknown) => {
            store.set(key, value);
          },
          removeItem: (key: string) => {
            store.delete(key);
          },
        },
      };
      const storage = testStorage(StorageType.SESSION, "key", scope as any);
      expect(storage?.type).to.equal(StorageType.SESSION);
    });
  });
});
