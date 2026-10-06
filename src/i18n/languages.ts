import { ar } from './locales/ar';
import { de } from './locales/de';
import { en, type Translations } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { hi } from './locales/hi';
import { id } from './locales/id';
import { pt } from './locales/pt';
import { tr } from './locales/tr';
import { ur } from './locales/ur';

export interface Language {
  code: LanguageCode;
  /** English name, shown as the subtitle in the picker. */
  name: string;
  /** Name in its own language, shown as the title. */
  nativeName: string;
  rtl: boolean;
  strings: Translations;
}

export type LanguageCode = 'en' | 'ar' | 'es' | 'fr' | 'pt' | 'de' | 'tr' | 'hi' | 'ur' | 'id';

/** Picker order. */
export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, strings: en },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, strings: ar },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, strings: es },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, strings: fr },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, strings: pt },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, strings: de },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, strings: tr },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, strings: hi },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true, strings: ur },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, strings: id },
];

export const languageByCode = Object.fromEntries(languages.map((l) => [l.code, l])) as Record<
  LanguageCode,
  Language
>;

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return value != null && value in languageByCode;
}
