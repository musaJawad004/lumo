import { addDays, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useT } from '@/i18n';
import { makeStyles, useTheme } from '@/theme';
import type { Habit, Logs } from '@/types/habit';
import { toDayKey } from '@/utils/dates';
import { isActiveOn } from '@/utils/schedule';
import { valueOn } from '@/utils/stats';

interface Props {
  habit: Habit;
  logs: Logs;
  weeks?: number;
  color: string;
  today?: Date;
}

const GAP = 4;

/**
 * GitHub-style grid: one column per week (Monday first), one cell per day.
 * Strength = share of the daily target reached; unscheduled days are faint, future days hidden.
 */
export function Heatmap({ habit, logs, weeks = 15, color, today = new Date() }: Props) {
  const t = useT();
  const { colors } = useTheme();
  const styles = useStyles();
  const todayKey = toDayKey(today);

  const columns = useMemo(() => {
    const firstMonday = addDays(startOfWeek(today, { weekStartsOn: 1 }), -(weeks - 1) * 7);
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = addDays(firstMonday, w * 7 + d);
        const key = toDayKey(date);
        if (key > todayKey) return { key, kind: 'future' as const, ratio: 0 };
        if (!isActiveOn(habit, key)) return { key, kind: 'off' as const, ratio: 0 };
        return { key, kind: 'due' as const, ratio: Math.min(valueOn(habit, logs, key) / habit.target, 1) };
      }),
    );
  }, [habit, logs, weeks, today, todayKey]);

  const level = (ratio: number) => (ratio <= 0 ? 0 : ratio < 0.34 ? 0.3 : ratio < 0.67 ? 0.55 : ratio < 1 ? 0.75 : 1);

  return (
    <View>
      <View style={styles.grid} accessibilityLabel={t('detail.historyBody')}>
        {columns.map((col, i) => (
          <View key={i} style={styles.col}>
            {col.map((cell) => (
              <View
                key={cell.key}
                style={[
                  styles.cell,
                  cell.kind === 'future' && styles.hidden,
                  cell.kind === 'off' && styles.off,
                  cell.kind === 'due' && { backgroundColor: cell.ratio > 0 ? color : colors.tile, opacity: cell.ratio > 0 ? level(cell.ratio) : 1 },
                  cell.key === todayKey && styles.today,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text variant="caption">{t('detail.less')}</Text>
        {[0.3, 0.55, 0.75, 1].map((o) => (
          <View key={o} style={[styles.legendCell, { backgroundColor: color, opacity: o }]} />
        ))}
        <Text variant="caption">{t('detail.more')}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: 'row', gap: GAP, marginTop: t.space.lg },
  col: { flex: 1, gap: GAP },
  cell: { aspectRatio: 1, borderRadius: 4 },
  off: { backgroundColor: t.colors.tile, opacity: 0.35 },
  hidden: { opacity: 0 },
  today: { borderWidth: 1.5, borderColor: t.colors.text },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: t.space.md },
  legendCell: { width: 11, height: 11, borderRadius: 3 },
}));
