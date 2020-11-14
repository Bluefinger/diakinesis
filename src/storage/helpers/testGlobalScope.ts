export const testGlobalScope = (globalScope?: Window): Window => {
  if (!globalScope) {
    try {
      globalScope = window;
    } catch (e) {
      globalScope = {} as Window;
    }
  }
  return globalScope;
};
