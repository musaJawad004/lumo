import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { GreetingHeader } from '@/components/home/GreetingHeader';
import { HabitSection } from '@/components/home/HabitSection';
import { QuickStart } from '@/components/home/QuickStart';
import { StreakCard, type DayBar } from '@/components/home/StreakCard';
import { WeekStrip, type DayStatus } from '@/components/home/WeekStrip';
import { Screen } from '@/components/layout/Screen';
import { HomeSkeleton } from '@/components/layout/Skeletons';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button, EmptyState, Segmented, type SegmentOption } from '@/components/ui';
import { icons } from '@/constants/icons';
import { useRefresh } from '@/hooks/useRefresh';
import { formatWeekday, useLanguage, useT, type TranslationKey } from '@/i18n';
import { nextLogValue, setLogValue } from '@/services/habits';
import { useHabitStore } from '@/store/habitStore';
import { useLogStore } from '@/store/logStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { makeStyles } from '@/theme';
import type { DayKey, Habit, TimeOfDay } from '@/types/habit';
import { dayRange, toDayKey } from '@/utils/dates';
import { currentStreak, dayProgress, habitsOn, isDone } from '@/utils/stats';

type Filter = 'todo' | 'completed' | 'pending';

const sections: { key: TimeOfDay; title: TranslationKey }[] = [
  { key: 'morning', title: 'home.morning' },
  { key: 'workload', title: 'home.workload' },
  { key: 'night', title: 'home.night' },
];

export default function HomeScreen() {
  const t = useT();
  const language = useLanguage();
  const styles = useStyles();
  const profile = useProfileStore((s) => s.profile);
  const allHabits = useHabitStore((s) => s.habits);
  const logs = useLogStore((s) => s.logs);
  const hideCompleted = useSettingsStore((s) => s.hideCompleted);

  const today = useMemo(() => new Date(), []);
  const strip = useMemo(() => dayRange(today, -3, 3), [today]);
  const [selected, setSelected] = useState<DayKey>(toDayKey(today));
  const [filter, setFilter] = useState<Filter>('todo');

  const { refreshing, onRefresh, showSkeleton } = useRefresh(allHabits.length > 0);
  const name = profile?.displayName.trim() ?? '';
  const habits = useMemo(() => [...allHabits].sort((a, b) => a.order - b.order), [allHabits]);
  const selectedOffset = strip.find((d) => d.key === selected)?.offset ?? 0;
  // Future days preview today's habits; past days show the habits that existed then.
  const dayHabits = selectedOffset > 0 ? habitsOn(habits, toDayKey(today)) : habitsOn(habits, selected);

  const filterOptions: SegmentOption<Filter>[] = [
    { value: 'todo', label: t('home.filterTodo'), icon: icons.listChecks },
    { value: 'completed', label: t('home.filterCompleted'), icon: icons.checkCircle },
    { value: 'pending', label: t('home.filterPending'), icon: icons.hourglass },
  ];

  const statusFor = (key: DayKey, offset: number): DayStatus => {
    if (offset > 0) return 'future';
    const { done, total } = dayProgress(habits, logs, key);
    return total > 0 && done === total ? 'done' : done > 0 ? 'partial' : 'none';
  };

  const visible = dayHabits.filter((h) => {
    const done = isDone(h, logs, selected);
    if (filter === 'completed') return done;
    if (filter === 'pending') return !done;
    return !(hideCompleted && done);
  });

  const values = Object.fromEntries(dayHabits.map((h) => [h.id, logs[h.id]?.[selected] ?? 0]));
  const log = (habit: Habit) => setLogValue(habit.id, selected, nextLogValue(habit, values[habit.id] ?? 0));

  const weekBars: DayBar[] = dayRange(today, -6, 0).map((day) => ({
    key: day.key,
    label: formatWeekday(day.date, language, 'narrow'),
    ...dayProgress(habits, logs, day.key),
    isToday: day.offset === 0,
  }));

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn index={0} style={styles.header}>
        <GreetingHeader
          title={name ? t('home.greeting', { name }) : t('home.greetingNoName')}
          subtitle={t('home.subtitle')}
          name={name || 'Lumo'}
          avatarUrl={profile?.avatarUrl}
          onAvatarPress={() => router.navigate('/settings')}
          onAddPress={() => router.push('/habit/new')}
          addLabel={t('tabs.newHabit')}
        />
      </FadeIn>

      {showSkeleton ? (
        <HomeSkeleton />
      ) : (
        <>
        <FadeIn index={1}>
          <WeekStrip
            days={strip.map((d) => ({ ...d, status: statusFor(d.key, d.offset) }))}
            selected={selected}
            onSelect={setSelected}
          />
        </FadeIn>

        <FadeIn index={2} style={styles.block}>
          <GlassCard radius={28}>
            {habits.length === 0 ? (
              <>
                <EmptyState
                  icon={icons.sparkle}
                  title={t('home.emptyTitle')}
                  body={t('home.emptyBody')}
                  action={<Button label={t('home.addHabit')} icon={icons.plus} onPress={() => router.push('/habit/new')} />}
                />
                <QuickStart />
              </>
            ) : (
              <>
                <Segmented options={filterOptions} value={filter} onChange={setFilter} variant="solid" />
                <View style={styles.sections}>
                  {sections.map(({ key, title }) => {
                    const items = visible.filter((h) => h.timeOfDay === key);
                    if (items.length === 0) return null;
                    return (
                      <HabitSection
                        key={key}
                        title={t(title)}
                        habits={items}
                        values={values}
                        onLog={log}
                        onEdit={(habit) => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
                        readOnly={selectedOffset > 0}
                      />
                    );
                  })}
                  {visible.length === 0 && (
                    <EmptyState
                      icon={filter === 'completed' ? icons.listChecks : icons.checkCircle}
                      title={t(filter === 'completed' ? 'home.emptyCompletedTitle' : 'home.allDoneTitle')}
                      body={t(filter === 'completed' ? 'home.emptyCompletedBody' : 'home.allDoneBody')}
                    />
                  )}
                </View>
              </>
            )}
          </GlassCard>
        </FadeIn>

        {habits.length > 0 && (
          <FadeIn index={3} style={styles.block}>
            <StreakCard streak={currentStreak(habits, logs, today)} days={weekBars} />
          </FadeIn>
        )}
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: { marginTop: t.space.sm, marginBottom: t.space.xl },
  block: { marginTop: t.space.xl },
  sections: { marginTop: t.space.md, gap: t.space.xs },
}));
