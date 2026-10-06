import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * Calm backdrop for every screen: one smooth blue wash at the top fading into the screen color,
 * plus a single soft glow behind it. Gives the glass surfaces something to blur without blotches.
 */
export function AmbientBackground() {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  const top = isDark ? '#14234A' : '#E3ECFF';

  return (
    <>
      <LinearGradient
        colors={[top, colors.screen]}
        locations={[0, 0.55]}
        style={[StyleSheet.absoluteFill, styles.passThrough]}
      />
      <Svg style={[StyleSheet.absoluteFill, styles.passThrough]} width={width} height={height}>
        <Defs>
          <RadialGradient id="ambientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.22 : 0.12} />
            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={width * 0.5} cy={-height * 0.02} rx={width * 0.95} ry={height * 0.32} fill="url(#ambientGlow)" />
      </Svg>
    </>
  );
}

const styles = StyleSheet.create({ passThrough: { pointerEvents: 'none' } });
