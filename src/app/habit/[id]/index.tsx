import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Heatmap } from '@/components/habit/Heatmap';
import { ProgressRing } from '@/components/habit/ProgressRing';
import { Screen } from '@/components/layout/Screen';
import { FadeIn } from '@/components/motion/FadeIn';
import { StatTile } from '@/components/stats/StatTile';
import { Button, IconButton, Pressable, Text } from '@/components/ui';
import { habitColors } from '@/constants/habitColors';
import { icons } from '@/constants/icons';
import { formatWeekday, useLanguage, useT, type TranslationKey } from '@/i18n';
import { setLogValue } from '@/services/habits';
import { useHabitStore } from '@/store/habitStore';
import { useLogStore } from '@/store/logStore';
import { makeStyles, useTheme } from '@/theme';
import { dayRange, toDayKey } from '@/utils/dates';
import { isActiveOn, sortWeekdays } from '@/utils/schedule';
import { habitBestStreak, habitRate, habitStreak, valueOn } from '@/utils/stats';

const timeLabel: Record<string, TranslationKey> = { morning: 'home.morning', workload: 'home.workload', night: 'home.night' };

/** One habit: today's ring (log right here), streaks, completion and a 15-week history. */
export default function HabitDetailScreen() {
  const t = useT();
  const language = useLanguage();
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
  const logs = useLogStore((s) => s.logs);
  const today = useMemo(() => new Date(), []);
  const todayKey = toDayKey(today);

  if (!habit) {
    return (
      <Screen>
        <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
      </Screen>
    );
  }

  const accent = habitColors[habit.color];
  const IconCmp = icons[habit.icon];
  const value = valueOn(habit, logs, todayKey);
  const done = value >= habit.target;
  const dueToday = isActiveOn(habit, todayKey);
  const last30 = dayRange(today, -29, 0).map((d) => d.key);

  const set = (next: number) => setLogValue(habit.id, todayKey, Math.max(0, Math.min(next, habit.target)));

  const schedule =
    habit.frequency.type === 'weekdays'
      ? sortWeekdays(habit.frequency.days)
          .map((d) => formatWeekday(dayRange(today, -6, 0).find((c) => c.date.getDay() === d)!.date, language))
          .join(' · ')
      : t('habit.everyDay');

  const reminder = habit.reminder.enabled
    ? t('detail.reminderAt', {
        time: new Date(2000, 0, 1, habit.reminder.hour, habit.reminder.minute).toLocaleTimeString(language.code, {
          hour: 'numeric',
          minute: '2-digit',
        }),
      })
    : t('detail.noReminder');

  return (
    <Screen>
      <FadeIn style={styles.header}>
        <IconButton icon={icons.caretLeft} mirrorInRTL onPress={() => router.back()} accessibilityLabel={t('common.back')} />
        <View style={styles.flex} />
        <IconButton
          icon={icons.pencilSimple}
          onPress={() => router.push({ pathname: '/habit/[id]/edit', params: { id: habit.id } })}
          accessibilityLabel={t('habit.editTitle')}
        />
      </FadeIn>

      <FadeIn index={1} style={styles.titleRow}>
        <View style={[styles.icon, { backgroundColor: accent.soft[isDark ? 1 : 0] }]}>
          <IconCmp size={24} color={accent.solid} weight="fill" />
        </View>
        <View style={styles.flex}>
          <Text variant="h1" numberOfLines={2}>
            {habit.name}
          </Text>
          <Text variant="body">
            {t(timeLabel[habit.timeOfDay])} · {schedule}
          </Text>
        </View>
      </FadeIn>

      <FadeIn index={2} style={styles.block}>
        <GlassCard radius={28}>
          <Text variant="overline" align="center">
            {t('detail.today')}
          </Text>
          <View style={styles.ringWrap}>
            <ProgressRing progress={value / habit.target} color={accent.solid}>
              <IconCmp size={30} color={accent.solid} weight="fill" />
              <Text variant="display" tabular style={styles.ringValue}>
                {habit.target > 1 ? `${value}/${habit.target}` : done ? '✓' : '0/1'}
              </Text>
              {habit.unit && habit.target > 1 && <Text variant="body">{habit.unit}</Text>}
            </ProgressRing>
          </View>
          {dueToday &&
            (habit.target > 1 ? (
              <View style={styles.stepper}>
                <Pressable onPress={() => set(value - 1)} disabled={value === 0} scaleTo={0.9} accessibilityLabel="-1" style={styles.stepBtn}>
                  <icons.minus size={22} color={colors.text} weight="bold" />
                </Pressable>
                <Pressable
                  onPress={() => set(value + 1)}
                  disabled={done}
                  haptic={value + 1 >= habit.target ? 'success' : 'light'}
                  scaleTo={0.9}
                  accessibilityLabel="+1"
                  style={[styles.stepBtn, styles.stepPlus, { backgroundColor: accent.solid }]}
                >
                  <icons.plus size={22} color={colors.white} weight="bold" />
                </Pressable>
              </View>
            ) : (
              <Button
                label={done ? t('detail.doneToday') : t('detail.markDone')}
                icon={done ? icons.checkCircle : icons.check}
                variant={done ? 'soft' : 'primary'}
                fullWidth
                onPress={() => set(done ? 0 : 1)}
                style={styles.markBtn}
              />
            ))}
        </GlassCard>
      </FadeIn>

      <FadeIn index={3} style={[styles.block, styles.tiles]}>
        <StatTile
          icon={icons.flame}
          color={colors.streak}
          value={t('stats.daysShort', { count: habitStreak(habit, logs, today) })}
          label={t('stats.currentStreak')}
        />
        <StatTile
          icon={icons.trophy}
          color="#EAB308"
          value={t('stats.daysShort', { count: habitBestStreak(habit, logs, today) })}
          label={t('stats.bestStreak')}
        />
        <StatTile
          icon={icons.checkCircle}
          color={colors.success}
          value={`${Math.round(habitRate(habit, logs, last30) * 100)}%`}
          label={t('detail.last30')}
        />
      </FadeIn>

      <FadeIn index={4} style={styles.block}>
        <GlassCard radius={24}>
          <View style={styles.cardHead}>
            <Text variant="h2">{t('detail.history')}</Text>
            <Text variant="caption">{t('detail.historyBody')}</Text>
          </View>
          <Heatmap habit={habit} logs={logs} color={accent.solid} today={today} />
        </GlassCard>
      </FadeIn>

      <FadeIn index={5} style={styles.block}>
        <GlassCard radius={20}>
          <View style={styles.infoRow}>
            <icons.calendarCheck size={18} color={colors.iconLine} />
            <Text variant="label">{schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <icons.bell size={18} color={colors.iconLine} />
            <Text variant="label">{reminder}</Text>
          </View>
          <View style={styles.infoRow}>
            <icons.flowerLotus size={18} color={colors.iconLine} />
            <Text variant="label">{t('detail.since', { date: format(new Date(habit.createdAt), 'd MMM yyyy') })}</Text>
          </View>
        </GlassCard>
      </FadeIn>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: t.space.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  block: { marginTop: t.space.xl },
  ringWrap: { alignItems: 'center', marginVertical: t.space.lg },
  ringValue: { marginTop: 4 },
  stepper: { flexDirection: 'row', justifyContent: 'center', gap: t.space.xl },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: { boxShadow: '0 6px 16px rgba(47,107,255,0.3)' },
  markBtn: { marginTop: t.space.xs },
  tiles: { flexDirection: 'row', gap: t.space.md },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, paddingVertical: 6 },
}));
