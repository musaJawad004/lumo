/* Test environment: replace native modules with in-memory fakes. */

jest.mock('expo-sqlite/kv-store', () => {
  const store = new Map<string, string>();
  const api = {
    getItemSync: (k: string) => store.get(k) ?? null,
    setItemSync: (k: string, v: string) => void store.set(k, v),
    removeItemSync: (k: string) => store.delete(k),
  };
  return { __esModule: true, default: api, Storage: api };
});

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en', textDirection: 'ltr' }] }));
