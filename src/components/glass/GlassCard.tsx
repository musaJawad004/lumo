import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { GlassView } from './GlassView';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  padded?: boolean;
}

/**
 * Frosted card. The soft shadow sits on the outer view and the glass (which clips) sits behind
 * the content, so rounded corners never turn square.
 */
export function GlassCard({ children, style, radius = 24, padded = true }: Props) {
  const { glass } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.shadow, { borderRadius: radius }, style]}>
      <GlassView intensity={40} fill={glass.cardFill} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
      <View style={padded && styles.padded}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  shadow: { boxShadow: t.isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(30,50,110,0.08)' },
  padded: { padding: t.space.lg },
}));
