import { useEffect } from 'react';
import { AppState } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { cancelAllReminders } from '@/services/notifications';
import { loadUser } from '@/services/session';
import { startSettingsSync } from '@/services/settingsSync';
import { clearLocalUserData, flushOutbox } from '@/services/sync';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useSyncStore } from '@/store/syncStore';

function signedOut() {
  clearLocalUserData();
  useProfileStore.getState().clear();
  cancelAllReminders();
  useSyncStore.getState().setStatus('idle');
  useAuthStore.getState().setSignedOut();
}

/**
 * Mount once at the root. Session lifecycle:
 * - launch: restore the stored session (Supabase refreshes the access token if it expired)
 * - SIGNED_IN / SIGNED_OUT: load or wipe the user's data
 * - TOKEN_REFRESHED: nothing to do (stored automatically)
 * - USER_UPDATED: keep the cached email in sync
 * - password-reset links land on /auth-callback?type=recovery, which opens "Change password"
 * - a revoked/invalid refresh token ends in SIGNED_OUT, which wipes local data
 */
export function useAuthListener() {
  useEffect(() => {
    if (!isSupabaseConfigured) {
      useAuthStore.getState().setSignedOut();
      return;
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      const user = data.session?.user;
      if (error || !user) {
        // e.g. "Invalid Refresh Token" after "sign out of all devices" on another phone.
        if (error) await supabase.auth.signOut({ scope: 'local' });
        signedOut();
        return;
      }
      loadUser(user.id, user.email ?? '');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Never await Supabase calls inside this callback (it can deadlock); defer instead.
      const user = session?.user;
      if (event === 'SIGNED_IN' && user && useAuthStore.getState().userId !== user.id) {
        setTimeout(() => loadUser(user.id, user.email ?? ''), 0);
      }
      if (event === 'USER_UPDATED' && user?.email) {
        useAuthStore.getState().setSignedIn(user.id, user.email);
        useProfileStore.getState().patchProfile({ email: user.email });
      }
      if (event === 'SIGNED_OUT') signedOut();
    });

    // Settings changes upload to the account (debounced).
    const stopSettingsSync = startSettingsSync();

    // Back in the foreground: send anything queued while offline.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') flushOutbox();
    });

    return () => {
      sub.subscription.unsubscribe();
      appState.remove();
      stopSettingsSync();
    };
  }, []);
}
