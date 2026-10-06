import { Platform } from 'react-native';

import type { ColorTokens } from './colors';

/** 4-pt spacing scale. Only use these values for margins, paddings and gaps. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  input: 14,
  card: 18,
  tile: 18,
  hero: 20,
  sheet: 28,
  pill: 999,
} as const;

export const layout = {
  screenPadding: 16,
  tileGap: 12,
  sectionGap: 24,
  touchTarget: 44,
  iconButton: 44,
  searchHeight: 44,
} as const;

/** Durations in ms. */
export const motion = {
  press: 120,
  release: 160,
  fade: 420,
  stagger: 60,
  themeFade: 350,
} as const;

export function makeShadows(isDark: boolean) {
  return {
    card: { boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.06)' },
    hero: { boxShadow: '0 8px 20px rgba(47,107,255,0.28)' },
    none: {},
  } as const;
}

/** Glass fills: Android has no real blur by default, so it gets a more opaque fill. */
export function makeGlass(isDark: boolean, colors: ColorTokens) {
  const android = Platform.OS === 'android';
  return {
    fill: isDark
      ? android ? 'rgba(28,31,36,0.92)' : 'rgba(28,31,36,0.6)'
      : android ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.62)',
    border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.8)',
    /** Content cards: more opaque than bars so text stays crisp. */
    cardFill: isDark
      ? android ? 'rgba(26,29,35,0.94)' : 'rgba(26,29,35,0.62)'
      : android ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.68)',
    onColorFill: 'rgba(255,255,255,0.15)',
    onColorBorder: 'rgba(255,255,255,0.5)',
    tint: (isDark ? 'dark' : 'light') as 'dark' | 'light',
    intensity: { button: 20, bar: 40, sheet: 60 },
    ringFill: colors.primarySoft,
  } as const;
}
