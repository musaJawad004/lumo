import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Logo geometry (docs/design/logo.svg) in a 1024 viewBox: 3/4 ring + dot in the gap. */
const R = 250;
const C = 2 * Math.PI * R;
const ARC = C * 0.75;
const DOT = { x: 335.2, y: 335.2, r: 46 };

/** On-screen size of the mark. */
const SIZE = 150;
const SCALE = SIZE / 1024;
const DOT_D = DOT.r * 2 * SCALE;
/** Dot centre relative to the screen centre. */
const DOT_OFFSET = (DOT.x / 1024 - 0.5) * SIZE;
const SWEEP = C * 0.12;
/** Extra room around the 1024 logo box so the glow and ripple aren't clipped (mark keeps its size). */
const PAD = 120;
const CANVAS = SIZE * ((1024 + PAD * 2) / 1024); // length of the light that sweeps around the ring

/** Exactly 3.5 s on screen; the safety timer guarantees the app is never stuck behind it. */
const TOTAL = 3500;
const SAFETY = TOTAL + 800;

const T = {
  drawStart: 200,
  drawEnd: 1300,
  dot: 1250,
  sweep: 1500,
  sweepEnd: 2250,
  breath: 2100,
  grow: 2350,
  growEnd: 3150,
  fade: 3050,
} as const;

interface Props {
  /** Called once the overlay is on screen (same background as the native splash): hide the native one. */
  onReady: () => void;
  onFinish: () => void;
}

/**
 * 3.5-second launch animation, no background tile and no text:
 * the blue ring draws itself (with a soft glow trail) → the dot pops in with a ripple →
 * a light sweeps around the ring and the mark breathes → the dot grows until it fills
 * the whole screen → the blue dissolves into the app.
 */
export function AnimatedSplash({ onReady, onFinish }: Props) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [laidOut, setLaidOut] = useState(false);
  const finished = useRef(false);

  const draw = useSharedValue(0); // 0 → 1: ring from nothing to the logo's 3/4 arc
  const dot = useSharedValue(0); // dot scale (pops past 1, settles at 1)
  const ripple = useSharedValue(0); // 0 → 1: ring of light spreading from the dot as it lands
  const sweep = useSharedValue(0); // 0 → 1: highlight position along the ring
  const breath = useSharedValue(1);
  const grow = useSharedValue(0); // 0 → 1: dot expands to cover the screen
  const exit = useSharedValue(0);

  // A circle big enough to cover the screen from the dot's position.
  const cover = 2 * Math.hypot(width, height);
  const dotX = width / 2 + DOT_OFFSET;
  const dotY = height / 2 + DOT_OFFSET;

  useEffect(() => {
    if (!laidOut) return;
    onReady();

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      onFinish();
    };
    const safety = setTimeout(finish, SAFETY);
    const done = (ok?: boolean) => {
      'worklet';
      if (ok) scheduleOnRN(finish);
    };

    if (reduceMotion) {
      draw.set(1);
      dot.set(1);
      exit.set(withDelay(TOTAL - 300, withTiming(1, { duration: 300 }, done)));
    } else {
      draw.set(withDelay(T.drawStart, withTiming(1, { duration: T.drawEnd - T.drawStart, easing: Easing.inOut(Easing.cubic) })));
      dot.set(
        withDelay(T.dot, withSequence(withTiming(1.4, { duration: 170, easing: Easing.out(Easing.cubic) }), withSpring(1, { damping: 7, stiffness: 190 }))),
      );
      ripple.set(withDelay(T.dot + 120, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })));
      sweep.set(withDelay(T.sweep, withTiming(1, { duration: T.sweepEnd - T.sweep, easing: Easing.inOut(Easing.quad) })));
      breath.set(
        withDelay(T.breath, withSequence(withTiming(1.05, { duration: 130 }), withTiming(1, { duration: 120, easing: Easing.inOut(Easing.quad) }))),
      );
      grow.set(withDelay(T.grow, withTiming(1, { duration: T.growEnd - T.grow, easing: Easing.bezier(0.7, 0, 0.25, 1) })));
      exit.set(withDelay(T.fade, withTiming(1, { duration: TOTAL - T.fade, easing: Easing.out(Easing.quad) }, done)));
    }

    return () => {
      clearTimeout(safety);
      [draw, dot, ripple, sweep, breath, grow, exit].forEach((v) => cancelAnimation(v));
    };
  }, [laidOut, reduceMotion, onReady, onFinish, draw, dot, ripple, sweep, breath, grow, exit]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C - ARC * draw.value,
    // A zero-length round-capped dash still paints a dot; stay hidden until drawing starts.
    opacity: draw.value > 0.005 ? 1 : 0,
  }));
  // Soft wide glow that follows the ring as it draws, then settles to a faint halo.
  const trailProps = useAnimatedProps(() => ({
    strokeDashoffset: C - ARC * draw.value,
    opacity: draw.value > 0.005 ? 0.18 - 0.08 * sweep.value : 0,
  }));
  const rippleProps = useAnimatedProps(() => ({
    r: DOT.r + 150 * ripple.value,
    opacity: ripple.value > 0 && ripple.value < 1 ? 0.55 * (1 - ripple.value) : 0,
  }));
  // A short bright highlight riding along the finished ring.
  const sweepProps = useAnimatedProps(() => ({
    strokeDashoffset: -(ARC - SWEEP) * sweep.value,
    opacity: sweep.value > 0 && sweep.value < 1 ? Math.sin(Math.PI * sweep.value) * 0.85 : 0,
  }));
  // The SVG dot hands over to the growing circle the moment growth starts.
  const dotProps = useAnimatedProps(() => ({ r: grow.value > 0 ? 0 : DOT.r * dot.value }));

  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));
  const coverStyle = useAnimatedStyle(() => ({
    opacity: grow.value > 0 ? 1 : 0,
    transform: [{ scale: DOT_D / cover + (1 - DOT_D / cover) * grow.value }],
  }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: colors.screen }, rootStyle]}
      onLayout={() => setLaidOut(true)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.center}>
        <Animated.View style={markStyle}>
          <Svg width={CANVAS} height={CANVAS} viewBox={`${-PAD} ${-PAD} ${1024 + PAD * 2} ${1024 + PAD * 2}`}>
            <G rotation={-90} origin="512, 512">
              <AnimatedCircle
                cx={512}
                cy={512}
                r={R}
                fill="none"
                stroke={colors.primary}
                strokeWidth={180}
                strokeLinecap="round"
                strokeDasharray={[C, C]}
                animatedProps={trailProps}
              />
              <AnimatedCircle
                cx={512}
                cy={512}
                r={R}
                fill="none"
                stroke={colors.primary}
                strokeWidth={92}
                strokeLinecap="round"
                strokeDasharray={[C, C]}
                animatedProps={ringProps}
              />
              <AnimatedCircle
                cx={512}
                cy={512}
                r={R}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={40}
                strokeLinecap="round"
                strokeDasharray={[SWEEP, C]}
                animatedProps={sweepProps}
              />
            </G>
            <AnimatedCircle
              cx={DOT.x}
              cy={DOT.y}
              fill="none"
              stroke={colors.primary}
              strokeWidth={10}
              animatedProps={rippleProps}
            />
            <AnimatedCircle cx={DOT.x} cy={DOT.y} fill={colors.primary} animatedProps={dotProps} />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.cover,
          {
            width: cover,
            height: cover,
            borderRadius: cover / 2,
            left: dotX - cover / 2,
            top: dotY - cover / 2,
            backgroundColor: colors.primary,
          },
          coverStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 100, elevation: 100, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { position: 'absolute' },
});
