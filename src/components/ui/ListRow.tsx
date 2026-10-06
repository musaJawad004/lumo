import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { I18nManager, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { icons, type Icon } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

interface RowProps {
  title: string;
  subtitle?: string;
  icon?: Icon;
  /** Background of the rounded-square icon badge (settings style). */
  iconColor?: string;
  /** Muted text on the right, e.g. "System". */
  value?: string;
  /** Custom right element (e.g. a Switch). Replaces value + chevron. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

/** Settings-style row. Shows a chevron automatically when pressable. */
export function ListRow({ title, subtitle, icon: IconCmp, iconColor, value, right, onPress, destructive }: RowProps) {
  const { colors } = useTheme();
  const styles = useStyles();

  const body = (
    <View style={styles.row}>
      {IconCmp && (
        <View style={[styles.badge, { backgroundColor: iconColor ?? colors.primary }]}>
          <IconCmp size={18} color={colors.white} weight="fill" />
        </View>
      )}
      <View style={styles.text}>
        <Text variant="name" color={destructive ? 'danger' : 'text'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (
        <>
          {value && <Text variant="label" color="textMuted">{value}</Text>}
          {onPress && <icons.caretRight size={16} color={colors.iconMuted} weight="bold" mirrored={I18nManager.isRTL} />}
        </>
      )}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} scaleTo={0.99} accessibilityLabel={title}>
      {body}
    </Pressable>
  );
}

interface GroupProps {
  children: ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

/** White rounded group of ListRows with hairline dividers between them. */
export function ListGroup({ children, title, style }: GroupProps) {
  const styles = useStyles();
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <View style={style}>
      {title && (
        <Text variant="overline" style={styles.groupTitle}>
          {title}
        </Text>
      )}
      <GlassCard radius={20} padded={false}>
        <View style={styles.group}>
          {rows.map((row, i) => (
            <Fragment key={row.key ?? i}>
              {i > 0 && <View style={styles.divider} />}
              {row}
            </Fragment>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  group: { paddingHorizontal: t.space.lg },
  groupTitle: { marginBottom: t.space.sm, marginLeft: t.space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, minHeight: 56, paddingVertical: t.space.sm },
  badge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.colors.border },
}));
