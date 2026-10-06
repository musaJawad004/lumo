import { create } from 'zustand';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  setSignedIn: (userId: string, email: string) => void;
  setSignedOut: () => void;
}

/** Mirrors the Supabase session (Supabase itself persists it). Driven by useAuthListener. */
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  userId: null,
  email: null,
  setSignedIn: (userId, email) => set({ status: 'signedIn', userId, email }),
  setSignedOut: () => set({ status: 'signedOut', userId: null, email: null }),
}));
