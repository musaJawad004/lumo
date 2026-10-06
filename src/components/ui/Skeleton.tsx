import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, useTheme } from '@/theme';

interface Props {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Placeholder block with a soft light sweeping across it while data loads. */
export function Skeleton({ width = '100%', height, radius = 12, style }: Props) {
  const { isDark } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const [boxWidth, setBoxWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || boxWidth === 0) return;
    x.set(withRepeat(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.quad) }), -1, false));
    return () => cancelAnimation(x);
  }, [boxWidth, reduceMotion, x]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -boxWidth + x.value * boxWidth * 2 }],
  }));

  const shine = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)';

  return (
    <View
      onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
      style={[styles.base, { width, height, borderRadius: radius }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {boxWidth > 0 && !reduceMotion && (
        <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', shine, 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: { overflow: 'hidden', backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(20,30,60,0.06)' },
}));
