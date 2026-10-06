import { resolveLanguage } from '@/i18n';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSyncStore } from '@/store/syncStore';

import { fetchProfile } from './api/account';
import { applyDirection, needsDirectionChange } from './direction';
import { reconcileSettings } from './settingsSync';
import { clearLocalUserData, pullFromServer } from './sync';

/** Signed in (launch or fresh sign-in): show cached data at once, then refresh everything from Supabase. */
export async function loadUser(userId: string, email: string) {
  // A different account on this device: never show the previous user's data.
  if (useProfileStore.getState().profile?.id !== userId) {
    clearLocalUserData();
    useProfileStore.getState().clear();
  }
  useAuthStore.getState().setSignedIn(userId, email);
  await refreshUserData({ firstLoad: true });
}

/**
 * Downloads profile, settings, habits and logs. Used on sign-in and by pull-to-refresh.
 * Never throws: offline simply keeps the cached data.
 */
export async function refreshUserData({ firstLoad = false } = {}) {
  const { userId, email } = useAuthStore.getState();
  if (!userId) return;
  useSyncStore.getState().setStatus('loading');
  try {
    const { profile, settings } = await fetchProfile(userId, email ?? '');
    useProfileStore.getState().setProfile(profile);
    if (firstLoad) {
      await reconcileSettings(userId, settings).catch((e) => console.warn('[settings] reconcile failed', e));
      // The account's language may need the other layout direction (Arabic/Urdu).
      const { rtl } = resolveLanguage(useSettingsStore.getState().language);
      if (needsDirectionChange(rtl)) applyDirection(rtl);
    }
    await pullFromServer();
    useSyncStore.getState().setStatus('ready');
  } catch (error) {
    console.warn('[sync] refresh failed (offline?)', error);
    useSyncStore.getState().setStatus('error');
  }
}

