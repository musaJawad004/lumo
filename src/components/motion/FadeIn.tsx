import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn as FadeInAnim,
  FadeInDown,
  FadeInUp,
  ReduceMotion,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

type Direction = 'up' | 'down' | 'none';

interface Props {
  children: ReactNode;
  /** Position in a list: each step adds `theme.motion.stagger` ms of delay. */
  index?: number;
  /** Extra delay in ms on top of the stagger. */
  delay?: number;
  duration?: number;
  /** 'up' rises into place (default), 'down' drops in, 'none' is a pure opacity fade. */
  from?: Direction;
  style?: StyleProp<ViewStyle>;
}

const builders = { up: FadeInDown, down: FadeInUp, none: FadeInAnim } as const;

/**
 * Fades (and gently slides) its children in on mount.
 * Wrap sections of a screen with increasing `index` to get a staggered reveal.
 * Honors the OS "Reduce Motion" setting.
 */
export function FadeIn({ children, index = 0, delay = 0, duration, from = 'up', style }: Props) {
  const { motion } = useTheme();
  const entering = builders[from]
    .duration(duration ?? motion.fade)
    .delay(delay + index * motion.stagger)
    .easing(Easing.out(Easing.cubic))
    .reduceMotion(ReduceMotion.System);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
