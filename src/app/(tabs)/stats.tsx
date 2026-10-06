import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Screen } from '@/components/layout/Screen';
import { StatsSkeleton } from '@/components/layout/Skeletons';
import { FadeIn } from '@/components/motion/FadeIn';
import { DailyChart, type ChartDay } from '@/components/stats/DailyChart';
import { StatTile } from '@/components/stats/StatTile';
import { Button, Chip, EmptyState, Pressable, Segmented, Text, type SegmentOption } from '@/components/ui';
import { habitColors } from '@/constants/habitColors';
import { icons } from '@/constants/icons';
import { useRefresh } from '@/hooks/useRefresh';
import { formatWeekday, useLanguage, useT } from '@/i18n';
import { useHabitStore } from '@/store/habitStore';
import { useLogStore } from '@/store/logStore';
import { makeStyles, useTheme } from '@/theme';
import { dayRange } from '@/utils/dates';
import {
  bestStreak,
  bestWeekday,
  completionRate,
  currentStreak,
  dayProgress,
  habitRate,
  habitStreak,
} from '@/utils/stats';

type Period = 'week' | 'month';

/** Real numbers from the user's synced habits and logs. Pull down to refresh from Supabase. */
export default function StatsScreen() {
  const t = useT();
  const language = useLanguage();
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const all = useHabitStore((s) => s.habits);
  const logs = useLogStore((s) => s.logs);
  const [period, setPeriod] = useState<Period>('week');

  const habits = useMemo(() => all.filter((h) => !h.archived).sort((a, b) => a.order - b.order), [all]);
  const { refreshing, onRefresh, showSkeleton } = useRefresh(habits.length > 0);

  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => dayRange(today, period === 'week' ? -6 : -29, 0), [today, period]);
  const keys = days.map((d) => d.key);

  const periodOptions: SegmentOption<Period>[] = [
    { value: 'week', label: t('stats.week') },
    { value: 'month', label: t('stats.month') },
  ];

  const chart: ChartDay[] = days.map((d, i) => {
    const { done, total } = dayProgress(habits, logs, d.key);
    const showLabel = period === 'week' || i % 5 === 0 || d.offset === 0;
    return {
      key: d.key,
      label: showLabel ? (period === 'week' ? formatWeekday(d.date, language, 'narrow') : String(d.date.getDate())) : '',
      ratio: total ? done / total : 0,
      isToday: d.offset === 0,
    };
  });

  const best = bestWeekday(habits, logs, dayRange(today, -27, 0).map((d) => d.date));
  const bestDayName = best === null ? null : formatWeekday(dayRange(today, -6, 0).find((d) => d.date.getDay() === best)!.date, language, 'long');

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn style={styles.header}>
        <Text variant="h1">{t('stats.title')}</Text>
        {habits.length > 0 && (
          <Segmented options={periodOptions} value={period} onChange={setPeriod} variant="solid" style={styles.period} />
        )}
      </FadeIn>

      {showSkeleton ? (
        <StatsSkeleton />
      ) : habits.length === 0 ? (
        <FadeIn index={1}>
          <GlassCard radius={28}>
            <EmptyState
              icon={icons.chartBar}
              title={t('stats.emptyTitle')}
              body={t('home.emptyBody')}
              action={<Button label={t('home.addHabit')} icon={icons.plus} onPress={() => router.push('/habit/new')} />}
            />
          </GlassCard>
        </FadeIn>
      ) : (
        <>
          <FadeIn index={1} style={styles.tiles}>
            <StatTile
              icon={icons.flame}
              color={colors.streak}
              value={t('stats.daysShort', { count: currentStreak(habits, logs, today) })}
              label={t('stats.currentStreak')}
            />
            <StatTile
              icon={icons.trophy}
              color="#EAB308"
              value={t('stats.daysShort', { count: bestStreak(habits, logs, today) })}
              label={t('stats.bestStreak')}
            />
            <StatTile
              icon={icons.checkCircle}
              color={colors.success}
              value={`${Math.round(completionRate(habits, logs, keys) * 100)}%`}
              label={t('stats.completion')}
            />
          </FadeIn>

          <FadeIn index={2} style={styles.block}>
            <GlassCard radius={24}>
              <View style={styles.cardHead}>
                <Text variant="h2" style={styles.flex}>
                  {t('stats.dailyProgress')}
                </Text>
                {bestDayName && <Chip label={t('stats.bestDay', { day: bestDayName })} icon={icons.sparkle} />}
              </View>
              <DailyChart days={chart} />
            </GlassCard>
          </FadeIn>

          <FadeIn index={3} style={styles.block}>
            <Text variant="overline" style={styles.label}>
              {t('stats.byHabit')}
            </Text>
            <View style={styles.list}>
              {habits.map((habit) => {
                const IconCmp = icons[habit.icon];
                const accent = habitColors[habit.color];
                const rate = habitRate(habit, logs, keys);
                const streak = habitStreak(habit, logs, today);
                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
                    scaleTo={0.98}
                    accessibilityLabel={habit.name}
                  >
                  <GlassCard radius={20} padded={false}>
                    <View style={styles.row}>
                      <View style={[styles.icon, { backgroundColor: accent.soft[isDark ? 1 : 0] }]}>
                        <IconCmp size={20} color={accent.solid} weight="fill" />
                      </View>
                      <View style={styles.flexGap}>
                        <View style={styles.rowTop}>
                          <Text variant="name" numberOfLines={1} style={styles.flex}>
                            {habit.name}
                          </Text>
                          {streak > 0 && <Chip label={`${streak}`} tone="streak" icon={icons.flame} />}
                          <Text variant="bodyStrong" color="text" tabular>
                            {Math.round(rate * 100)}%
                          </Text>
                        </View>
                        <View style={styles.track}>
                          <View style={[styles.fill, { width: `${Math.round(rate * 100)}%`, backgroundColor: accent.solid }]} />
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                  </Pressable>
                );
              })}
            </View>
          </FadeIn>
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  flexGap: { flex: 1, gap: t.space.sm },
  header: { gap: t.space.lg, marginBottom: t.space.xl },
  period: { alignSelf: 'stretch' },
  tiles: { flexDirection: 'row', gap: t.space.md },
  block: { marginTop: t.space.xl },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  label: { marginBottom: t.space.sm, marginStart: t.space.xs },
  list: { gap: t.space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, padding: t.space.md, paddingEnd: t.space.lg },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: t.colors.tile, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
}));
