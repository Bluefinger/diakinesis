import type { BrowserStorage } from "../";
import { WrappedStorage } from "../storages/wrapped";

const testedRecord = Symbol("tested");

interface WindowTested {
  [testedRecord]: Record<BrowserStorage, boolean>;
}

const getTests = (scope: unknown) =>
  ((scope as WindowTested)[testedRecord] ??= {} as Record<BrowserStorage, boolean>);

const hasBeenTested = (type: BrowserStorage, tested: Record<BrowserStorage, boolean>) =>
  type in tested;

export const testStorage = <T>(
  type: BrowserStorage,
  key: string,
  scope: Window
): WrappedStorage<T> | undefined => {
  const storage = scope[type];
  const tested = getTests(scope);
  if (!hasBeenTested(type, tested)) {
    try {
      const test = `test-${type}-${Date.now()}`;
      storage.setItem(test, test);
      const result = storage.getItem(test);
      storage.removeItem(test);
      tested[type] = result === test;
    } catch (e) {
      tested[type] = false;
    }
  }
  if (tested[type]) {
    return new WrappedStorage<T>(type, key, storage);
  }
};
