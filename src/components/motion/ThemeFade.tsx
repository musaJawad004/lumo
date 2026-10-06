import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme';

/**
 * Smooths light ↔ dark switches: when the theme changes, the previous background color
 * is laid over the app and faded out, so the new theme dissolves in instead of snapping.
 * Mount once, as the last child of the root layout.
 */
export function ThemeFade() {
  const { colors, motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const previous = useRef(colors.screen);
  const [veil, setVeil] = useState<string | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (previous.current === colors.screen) return;
    const from = previous.current;
    previous.current = colors.screen;
    if (reduceMotion) return;

    setVeil(from);
    opacity.set(1);
    opacity.set(
      withTiming(0, { duration: motion.themeFade }, (finished) => {
        if (finished) scheduleOnRN(setVeil, null);
      }),
    );
  }, [colors.screen, motion.themeFade, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!veil) return null;
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.passThrough, { backgroundColor: veil }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  passThrough: { pointerEvents: 'none' },
});
