import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Profile } from '@/services/api/account';

import { kvStorage } from './persist';

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  patchProfile: (patch: Partial<Pick<Profile, 'displayName' | 'avatarUrl' | 'email'>>) => void;
  clear: () => void;
}

/** Cached copy of the signed-in user's profile so it shows instantly (and offline). */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      patchProfile: (patch) => set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : s)),
      clear: () => set({ profile: null }),
    }),
    { name: 'lumo.profile', version: 1, storage: kvStorage, partialize: ({ profile }) => ({ profile }) },
  ),
);
