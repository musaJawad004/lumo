import { create } from 'zustand';

type SyncStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SyncState {
  /** Server download state for the signed-in user (drives skeletons + pull-to-refresh). */
  status: SyncStatus;
  lastSyncedAt: number | null;
  setStatus: (status: SyncStatus) => void;
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: 'idle',
  lastSyncedAt: null,
  setStatus: (status) => set(status === 'ready' ? { status, lastSyncedAt: Date.now() } : { status }),
}));
