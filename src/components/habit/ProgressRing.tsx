import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 0–1 */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}

/** Circular progress that animates whenever the value changes. Content is centred inside. */
export function ProgressRing({ progress, size = 200, stroke = 16, color, children }: Props) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = useSharedValue(0);

  useEffect(() => {
    value.set(withTiming(Math.min(Math.max(progress, 0), 1), { duration: 650, easing: Easing.out(Easing.cubic) }));
  }, [progress, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - value.value),
    opacity: value.value > 0.001 ? 1 : 0,
  }));

  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.primarySoft} strokeWidth={stroke} />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color ?? colors.primary}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={[c, c]}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
