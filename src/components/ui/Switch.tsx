import { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, useTheme } from '@/theme';

import { Pressable } from './Pressable';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

const W = 50;
const H = 30;
const KNOB = 26;
const TRAVEL = W - KNOB - 4;

/** iOS-style switch with the same look on both platforms. Indigo when on. */
export function Switch({ value, onValueChange, accessibilityLabel, disabled }: Props) {
  const { colors, motion } = useTheme();
  const styles = useStyles();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(value ? 1 : 0, { duration: motion.release + 60 }));
  }, [value, progress, motion.release]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: progress.value * TRAVEL }] }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      scaleTo={0.95}
      haptic="light"
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  track: { width: W, height: H, borderRadius: H / 2, padding: 2, justifyContent: 'center' },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
}));
