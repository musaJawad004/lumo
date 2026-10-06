import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Zustand persist storage backed by expo-sqlite's key-value store.
 * Sync methods mean stores hydrate before the first render, so the UI never flashes default values.
 */
export const kvStorage = createJSONStorage(() => ({
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
}));
