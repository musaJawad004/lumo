import { getLocales } from 'expo-localization';
import { useCallback } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import type { LanguagePreference } from '@/types/settings';

import { isLanguageCode, languageByCode, type Language, type LanguageCode } from './languages';
import type { TranslationKey } from './locales/en';

export { languages, languageByCode, type Language, type LanguageCode } from './languages';
export type { TranslationKey } from './locales/en';

type Vars = Record<string, string | number>;

/** Device language if we support it, otherwise English. */
export function deviceLanguage(): LanguageCode {
  const code = getLocales()[0]?.languageCode;
  return isLanguageCode(code) ? code : 'en';
}

export function resolveLanguage(preference: LanguagePreference): Language {
  return languageByCode[preference === 'system' ? deviceLanguage() : preference];
}

/** Looks up a key and fills `{{placeholders}}`. Falls back to English, then to the key itself. */
export function translate(language: Language, key: TranslationKey, vars?: Vars): string {
  const template = language.strings[key] ?? languageByCode.en.strings[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

/** Current language (re-renders when the user switches). */
export function useLanguage(): Language {
  const preference = useSettingsStore((s) => s.language);
  return resolveLanguage(preference);
}

/** `const t = useT(); t('home.greeting', { name })` */
export function useT() {
  const language = useLanguage();
  return useCallback((key: TranslationKey, vars?: Vars) => translate(language, key, vars), [language]);
}

/** Localized weekday, e.g. "Tue" / "mar." / "الثلاثاء". Uses the platform's Intl data. */
export function formatWeekday(date: Date, language: Language, width: 'short' | 'narrow' | 'long' = 'short'): string {
  return date.toLocaleDateString(language.code, { weekday: width });
}

/** Localized long date for screen readers, e.g. "Tuesday, 6 October". */
export function formatLongDate(date: Date, language: Language): string {
  return date.toLocaleDateString(language.code, { weekday: 'long', day: 'numeric', month: 'long' });
}
