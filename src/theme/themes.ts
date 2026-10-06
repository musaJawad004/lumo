import { darkColors, lightColors, type ColorTokens } from './colors';
import { typography } from './typography';
import { layout, makeGlass, makeShadows, motion, radius, space } from './tokens';

export type ColorScheme = 'light' | 'dark';

function createTheme(scheme: ColorScheme) {
  const isDark = scheme === 'dark';
  const colors: ColorTokens = isDark ? darkColors : lightColors;
  return {
    scheme,
    isDark,
    colors,
    type: typography,
    space,
    radius,
    layout,
    motion,
    shadow: makeShadows(isDark),
    glass: makeGlass(isDark, colors),
  };
}

export type Theme = ReturnType<typeof createTheme>;

/** Both themes are built once at startup; switching is just a lookup. */
export const themes: Record<ColorScheme, Theme> = {
  light: createTheme('light'),
  dark: createTheme('dark'),
};
