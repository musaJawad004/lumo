import type { LanguageCode } from '@/i18n/languages';

export type ThemePreference = 'system' | 'light' | 'dark';

/** 'system' follows the phone's language when Lumo supports it. */
export type LanguagePreference = LanguageCode | 'system';

export interface ReminderTime {
  hour: number;
  minute: number;
}
