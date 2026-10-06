import * as SystemUI from 'expo-system-ui';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';

import { themes, type Theme } from './themes';

const ThemeContext = createContext<Theme>(themes.light);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSettingsStore((s) => s.theme);

  // Overriding the native appearance keeps system UI (keyboard, alerts, liquid glass) in sync
  // with the in-app choice. 'unspecified' hands control back to the OS.
  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const system = useColorScheme();
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = themes[scheme];

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.screen);
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
