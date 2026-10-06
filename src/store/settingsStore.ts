import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LanguagePreference, ReminderTime, ThemePreference } from '@/types/settings';

import { kvStorage } from './persist';

interface SettingsData {
  theme: ThemePreference;
  language: LanguagePreference;
  haptics: boolean;
  /** General "check in on your habits" nudge. */
  reminderEnabled: boolean;
  reminderTime: ReminderTime;
  /** Master switch for the per-habit reminders set in each habit. */
  habitReminders: boolean;
  /** Hide finished habits from Home's "To Do" list. */
  hideCompleted: boolean;
}

interface SettingsState extends SettingsData {
  set: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  setHaptics: (enabled: boolean) => void;
  reset: () => void;
}

const defaults: SettingsData = {
  theme: 'system',
  language: 'system',
  haptics: true,
  reminderEnabled: false,
  reminderTime: { hour: 20, minute: 0 },
  habitReminders: true,
  hideCompleted: false,
};

/** Device-level preferences (not synced: they belong to this phone). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (key, value) => set({ [key]: value } as Partial<SettingsData>),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setHaptics: (haptics) => set({ haptics }),
      reset: () => set(defaults),
    }),
    {
      name: 'lumo.settings',
      version: 3,
      storage: kvStorage,
      migrate: (persisted) => ({ ...defaults, ...(persisted as Partial<SettingsData>) }),
      partialize: (s): SettingsData => ({
        theme: s.theme,
        language: s.language,
        haptics: s.haptics,
        reminderEnabled: s.reminderEnabled,
        reminderTime: s.reminderTime,
        habitReminders: s.habitReminders,
        hideCompleted: s.hideCompleted,
      }),
    },
  ),
);
