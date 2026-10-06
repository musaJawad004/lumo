import { languages, translate } from '@/i18n';
import { en } from '@/i18n/locales/en';

const placeholders = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort();

describe('translations', () => {
  const keys = Object.keys(en).sort();

  it.each(languages.map((l) => [l.code, l] as const))('%s has exactly the English keys', (_code, language) => {
    expect(Object.keys(language.strings).sort()).toEqual(keys);
  });

  it.each(languages.map((l) => [l.code, l] as const))('%s keeps every {{placeholder}}', (_code, language) => {
    for (const key of keys) {
      expect([key, placeholders(language.strings[key as keyof typeof en])]).toEqual([key, placeholders(en[key as keyof typeof en])]);
    }
  });

  it.each(languages.map((l) => [l.code, l] as const))('%s has no empty strings', (_code, language) => {
    for (const value of Object.values(language.strings)) expect(value.trim()).not.toBe('');
  });

  it('fills placeholders', () => {
    const english = languages.find((l) => l.code === 'en')!;
    expect(translate(english, 'home.greeting', { name: 'Musa' })).toBe('Hey, Musa 👋');
    expect(translate(english, 'home.daysComplete', { done: 3, total: 7 })).toBe('3 of 7 days complete');
  });

  it('marks Arabic and Urdu as right-to-left', () => {
    expect(languages.filter((l) => l.rtl).map((l) => l.code).sort()).toEqual(['ar', 'ur']);
  });
});
