import type { TextStyle } from 'react-native';

import type { ColorToken } from './colors';

/** Font family names registered in the root layout via useFonts. Never use weights above 600. */
export const fonts = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  h1: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3 },
  title: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  name: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  chip: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
  tab: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;

/** Default color for each variant when no color prop is given. */
export const variantColor: Record<TextVariant, ColorToken> = {
  display: 'text',
  h1: 'text',
  h2: 'text',
  title: 'textBody',
  name: 'text',
  bodyStrong: 'textBody',
  body: 'textMuted',
  label: 'textBody',
  chip: 'primary',
  caption: 'textMuted',
  overline: 'textMuted',
  tab: 'textMuted',
};
