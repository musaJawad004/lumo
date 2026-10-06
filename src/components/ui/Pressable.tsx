import {
  Pressable as RNPressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';
import type { HapticKind } from '@/services/haptics';
import { useTheme } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface LumoPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Set to 1 to disable. */
  scaleTo?: number;
  haptic?: HapticKind | 'none';
}

/** Every tappable thing in Lumo: press-scale animation + haptic feedback built in. */
export function Pressable({
  style,
  scaleTo = 0.97,
  haptic = 'selection',
  onPressIn,
  onPressOut,
  onPress,
  accessibilityRole = 'button',
  disabled,
  ...rest
}: LumoPressableProps) {
  const { motion } = useTheme();
  const reduceMotion = useReducedMotion();
  const triggerHaptic = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduceMotion) scale.set(withTiming(scaleTo, { duration: motion.press }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: motion.release }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic !== 'none') triggerHaptic(haptic);
        onPress?.(e);
      }}
      style={[style, disabled && { opacity: 0.5 }, animatedStyle]}
      {...rest}
    />
  );
}
