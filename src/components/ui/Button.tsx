import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassView } from '@/components/glass/GlassView';
import type { Icon } from '@/constants/icons';
import { makeStyles, useTheme, type ColorToken } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

type Variant = 'primary' | 'soft' | 'glass' | 'ghost';
type Size = 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: Icon;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Shows a spinner and blocks presses (e.g. while signing in). */
  loading?: boolean;
  /** Override the label color, e.g. 'danger' for a destructive ghost button. */
  labelColor?: ColorToken;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pill button.
 * - primary: solid indigo
 * - soft: indigo tint + border ("View All", "Following")
 * - glass: frosted, for use on top of the hero gradient / images
 * - ghost: text only
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: IconCmp,
  fullWidth,
  disabled,
  loading,
  labelColor,
  style,
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles();

  const variantFg = {
    primary: colors.white,
    soft: colors.primary,
    glass: colors.white,
    ghost: colors.primary,
  }[variant];
  const fg = labelColor ? colors[labelColor] : variantFg;

  const content = (
    <View style={[styles.row, size === 'sm' ? styles.sm : styles.md]}>
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        IconCmp && <IconCmp size={size === 'sm' ? 14 : 18} color={fg} weight="bold" />
      )}
      <Text variant={size === 'sm' ? 'chip' : 'bodyStrong'} color={fg} style={size === 'sm' && styles.smText}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      style={[styles.base, fullWidth && styles.full, variantStyle(variant, styles), style]}
    >
      {variant === 'glass' ? (
        <GlassView onColor intensity={20} style={StyleSheet.absoluteFill} />
      ) : null}
      {variant === 'primary' ? (
        // Glass sheen: a soft light from the top edge fading out, like light on a glass pill.
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
          locations={[0, 0.6]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

function variantStyle(variant: Variant, styles: ReturnType<typeof useStyles>) {
  return { primary: styles.primary, soft: styles.soft, glass: styles.glass, ghost: null }[variant];
}

const useStyles = makeStyles((t) => ({
  base: { borderRadius: t.radius.pill, overflow: 'hidden', alignSelf: 'flex-start' },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space.xs + 2 },
  md: { paddingVertical: t.space.md, paddingHorizontal: t.space.xl, minHeight: t.layout.touchTarget },
  sm: { paddingVertical: 6, paddingHorizontal: t.space.md },
  smText: { fontSize: 14 },
  primary: {
    backgroundColor: t.colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    boxShadow: '0 6px 18px rgba(47,107,255,0.35)',
  },
  soft: { backgroundColor: t.colors.primarySoft, borderWidth: 1, borderColor: t.colors.primaryLine },
  glass: { borderWidth: 1, borderColor: t.glass.onColorBorder },
}));
