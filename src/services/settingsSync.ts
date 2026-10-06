import { languageByCode } from '@/i18n/languages';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { LanguagePreference, ThemePreference } from '@/types/settings';

import { saveSettings } from './api/account';

/**
 * Settings follow the account: language + theme live in their own profile columns,
 * everything else in `profiles.preferences` (jsonb).
 */

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];

type Snapshot = ReturnType<typeof snapshot>;

/** True while remote settings are being applied, so they aren't immediately re-uploaded. */
let applying = false;

function snapshot() {
  const s = useSettingsStore.getState();
  return {
    language: s.language as string,
    theme: s.theme as string,
    preferences: {
      haptics: s.haptics,
      hideCompleted: s.hideCompleted,
      reminderEnabled: s.reminderEnabled,
      reminderTime: s.reminderTime,
      habitReminders: s.habitReminders,
    },
  };
}

const isDefault = (remote: Snapshot) =>
  remote.language === 'system' && remote.theme === 'system' && Object.keys(remote.preferences).length === 0;

/**
 * On sign-in: if the account already has settings, apply them to this phone;
 * otherwise upload this phone's settings (first sign-in keeps what the user already chose).
 */
export async function reconcileSettings(userId: string, remote: { language: string; theme: string; preferences: Record<string, unknown> }) {
  if (isDefault(remote as Snapshot)) {
    await saveSettings(userId, snapshot());
    return;
  }
  const p = remote.preferences;
  const pick = <T,>(key: string, fallback: T): T => (key in p ? (p[key] as T) : fallback);
  const current = useSettingsStore.getState();
  applying = true;
  useSettingsStore.setState({
    language: (remote.language === 'system' || remote.language in languageByCode
      ? remote.language
      : current.language) as LanguagePreference,
    theme: THEMES.includes(remote.theme as ThemePreference) ? (remote.theme as ThemePreference) : current.theme,
    haptics: pick('haptics', current.haptics),
    hideCompleted: pick('hideCompleted', current.hideCompleted),
    reminderEnabled: pick('reminderEnabled', current.reminderEnabled),
    reminderTime: pick('reminderTime', current.reminderTime),
    habitReminders: pick('habitReminders', current.habitReminders),
  });
  applying = false;
}

let timer: ReturnType<typeof setTimeout> | undefined;
let lastSent = '';

/** Uploads settings shortly after the user changes them (debounced). Returns an unsubscribe. */
export function startSettingsSync(): () => void {
  return useSettingsStore.subscribe(() => {
    if (applying) return;
    const userId = useAuthStore.getState().userId;
    if (!userId) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const next = snapshot();
      const key = JSON.stringify(next);
      if (key === lastSent) return;
      saveSettings(userId, next)
        .then(() => {
          lastSent = key;
        })
        .catch((error) => console.warn('[settings] sync failed, will retry on next change', error));
    }, 800);
  });
}
