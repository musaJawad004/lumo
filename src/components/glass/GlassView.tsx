import { BlurView } from 'expo-blur';
import { GlassView as LiquidGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Blur strength for the expo-blur fallback (1–100). */
  intensity?: number;
  /** For glass sitting on a colored surface (hero gradient): clear white frost instead of a light/dark fill. */
  onColor?: boolean;
  /** Draw the 1px light edge. Glass should almost always have one. */
  bordered?: boolean;
  /** Override the tint layer on the blur fallback (e.g. a stronger fill for sheets holding forms). */
  fill?: string;
}

const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

/**
 * Frosted glass surface.
 * iOS 26+: native Liquid Glass. Older iOS: blur + tint. Android: tinted, more opaque fill.
 * Rule: only for floating elements (tab bar, sheets, buttons on images). Never for cards.
 */
export function GlassView({ children, style, intensity, onColor, bordered = true, fill }: Props) {
  const { glass, scheme } = useTheme();
  const edge = bordered && {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: onColor ? glass.onColorBorder : glass.border,
  };

  if (liquidGlass) {
    return (
      <LiquidGlassView
        glassEffectStyle={onColor ? 'clear' : 'regular'}
        colorScheme={onColor ? 'dark' : scheme}
        style={[styles.clip, edge, style]}
      >
        {children}
      </LiquidGlassView>
    );
  }

  return (
    <View style={[styles.clip, edge, style]}>
      <BlurView
        intensity={intensity ?? glass.intensity.bar}
        tint={onColor ? 'light' : glass.tint}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fill ?? (onColor ? glass.onColorFill : glass.fill) }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
