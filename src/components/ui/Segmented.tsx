import { useState } from 'react';
import { I18nManager, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import type { Icon } from '@/constants/icons';
import { GlassView } from '@/components/glass/GlassView';
import { makeStyles, useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: Icon;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 'solid' = blue pill thumb with white text (filter tabs on Home). */
  variant?: 'default' | 'solid';
  style?: StyleProp<ViewStyle>;
}

const PAD = 3;

/** iOS-style segmented control with a sliding white thumb. */
export function Segmented<T extends string>({ options, value, onChange, variant = 'default', style }: Props<T>) {
  const { colors, motion, isDark } = useTheme();
  const styles = useStyles();
  const glassFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.45)';
  const [width, setWidth] = useState(0);

  const solid = variant === 'solid';
  const segmentWidth = width > 0 ? (width - PAD * 2) / options.length : 0;
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: withTiming((I18nManager.isRTL ? -1 : 1) * activeIndex * segmentWidth, { duration: motion.fade - 140 }) }],
  }));

  return (
    <View
      style={[styles.root, solid && styles.rootSolid, style]}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
    >
      <GlassView intensity={30} bordered={false} fill={glassFill} style={[StyleSheet.absoluteFill, solid ? styles.glassPill : styles.glassBox]} />
      {segmentWidth > 0 && <Animated.View style={[styles.thumb, solid && styles.thumbSolid, thumbStyle]} />}
      {options.map(({ value: v, label, icon: IconCmp }) => {
        const active = v === value;
        const fg = active ? (solid ? colors.white : colors.text) : colors.textMuted;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            scaleTo={1}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            style={styles.segment}
          >
            {IconCmp && <IconCmp size={16} color={fg} weight={active ? 'fill' : 'light'} />}
            <Text variant={active ? 'bodyStrong' : 'label'} color={fg} numberOfLines={1} style={styles.label}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: t.radius.input,
    borderWidth: 1,
    borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
  },
  glassBox: { borderRadius: t.radius.input },
  glassPill: { borderRadius: t.radius.pill },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: t.radius.input - PAD,
    backgroundColor: t.isDark ? t.colors.border : t.colors.surface,
    ...t.shadow.card,
  },
  rootSolid: { borderRadius: t.radius.pill, borderWidth: 0 },
  thumbSolid: { borderRadius: t.radius.pill, backgroundColor: t.colors.primary, boxShadow: '0 4px 12px rgba(47,107,255,0.3)' },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: t.space.sm + 2,
  },
  label: { fontSize: 14, lineHeight: 18 },
}));
