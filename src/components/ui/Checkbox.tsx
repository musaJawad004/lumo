import { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { icons } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

const SIZE = 22;

/** Rounded-square checkbox (visual only; the parent row handles the press). Pops when checked. */
export function Checkbox({ checked }: { checked: boolean }) {
  const { colors, motion } = useTheme();
  const styles = useStyles();
  const progress = useSharedValue(checked ? 1 : 0);
  const pop = useSharedValue(1);

  useEffect(() => {
    progress.set(withTiming(checked ? 1 : 0, { duration: motion.press + 60 }));
    if (checked) pop.set(withSequence(withTiming(1.2, { duration: 100 }), withSpring(1, { damping: 10 })));
  }, [checked, progress, pop, motion.press]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.iconMuted, colors.primary]),
    transform: [{ scale: pop.value }],
  }));
  const tickStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View style={[styles.box, boxStyle]}>
      <Animated.View style={tickStyle}>
        <icons.check size={14} color={colors.white} weight="bold" />
      </Animated.View>
    </Animated.View>
  );
}

const useStyles = makeStyles(() => ({
  box: {
    width: SIZE,
    height: SIZE,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
