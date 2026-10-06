import { format } from 'date-fns';
import { StyleSheet, View } from 'react-native';

import { GlassView } from '@/components/glass/GlassView';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { icons } from '@/constants/icons';
import { formatLongDate, formatWeekday, useLanguage, useT } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';
import type { DayKey } from '@/types/habit';
import type { DayCell } from '@/utils/dates';

export type DayStatus = 'done' | 'partial' | 'none' | 'future';

interface Props {
  days: (DayCell & { status: DayStatus })[];
  selected: DayKey;
  onSelect: (key: DayKey) => void;
}

const CIRCLE = 36;

/**
 * Row of day capsules (weekday + date). Selected day = solid blue circle,
 * fully done days get a ✓ badge, partly done past days get a dashed ring.
 */
export function WeekStrip({ days, selected, onSelect }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const language = useLanguage();
  const glassIdle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)';
  const glassActive = isDark ? 'rgba(47,107,255,0.16)' : 'rgba(255,255,255,0.85)';
  const t = useT();

  return (
    <View style={styles.row}>
      {days.map((day) => {
        const active = day.key === selected;
        return (
          <Pressable
            key={day.key}
            onPress={() => onSelect(day.key)}
            scaleTo={0.92}
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${formatLongDate(day.date, language)}${day.offset === 0 ? `, ${t('home.today')}` : ''}`}
            style={[styles.pill, active && styles.pillActive]}
          >
            <GlassView intensity={30} bordered={false} fill={active ? glassActive : glassIdle} style={StyleSheet.absoluteFill} />
            <Text
              variant={active ? 'chip' : 'caption'}
              color={active ? 'text' : 'textMuted'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.weekday}
            >
              {formatWeekday(day.date, language)}
            </Text>
            <View style={[styles.circle, day.status === 'partial' && !active && styles.partial, active && styles.active]}>
              <Text variant="bodyStrong" tabular color={active ? 'white' : day.status === 'future' ? 'textMuted' : 'text'}>
                {format(day.date, 'd')}
              </Text>
              {day.status === 'done' && !active && (
                <View style={styles.badge}>
                  <icons.check size={8} color={colors.white} weight="bold" />
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: t.space.sm,
    paddingTop: t.space.md,
    paddingBottom: 5,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
  },
  pillActive: { borderColor: t.colors.primaryLine },
  weekday: { paddingHorizontal: 3 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partial: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.iconMuted },
  active: { backgroundColor: t.colors.primary, boxShadow: '0 4px 12px rgba(47,107,255,0.4)' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: t.colors.primary,
    borderWidth: 1.5,
    borderColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
