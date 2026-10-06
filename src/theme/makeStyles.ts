import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { Theme } from './themes';
import { useTheme } from './ThemeProvider';

/**
 * Theme-aware StyleSheet. Define once at module level, call the returned hook in the component:
 *   const useStyles = makeStyles((t) => ({ root: { backgroundColor: t.colors.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
