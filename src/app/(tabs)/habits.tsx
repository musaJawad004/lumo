import { router } from 'expo-router';
import { useMemo } from 'react';
import { I18nManager, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { QuickStart } from '@/components/home/QuickStart';
import { Screen } from '@/components/layout/Screen';
import { ListSkeleton } from '@/components/layout/Skeletons';
import { FadeIn } from '@/components/motion/FadeIn';
import { Button, EmptyState, IconButton, Pressable, Text } from '@/components/ui';
import { habitColors } from '@/constants/habitColors';
import { icons } from '@/constants/icons';
import { useRefresh } from '@/hooks/useRefresh';
import { useT, type TranslationKey } from '@/i18n';
import { useHabitStore } from '@/store/habitStore';
import type { Habit } from '@/types/habit';
import { makeStyles, useTheme } from '@/theme';

const timeLabel: Record<string, TranslationKey> = { morning: 'home.morning', workload: 'home.workload', night: 'home.night' };

/** Every habit; tap one to edit it. */
export default function HabitsScreen() {
  const t = useT();
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const all = useHabitStore((s) => s.habits);
  const habits = useMemo(() => all.filter((h) => !h.archived).sort((a, b) => a.order - b.order), [all]);
  const archived = useMemo(() => all.filter((h) => h.archived).sort((a, b) => a.order - b.order), [all]);
  const { refreshing, onRefresh, showSkeleton } = useRefresh(habits.length > 0);

  const renderRow = (habit: Habit, dim = false) => {
    const IconCmp = icons[habit.icon];
    const accent = habitColors[habit.color];
    return (
      <Pressable
        key={habit.id}
        onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
        scaleTo={0.98}
        accessibilityLabel={habit.name}
        style={dim && styles.dim}
      >
        <GlassCard radius={20} padded={false}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: accent.soft[isDark ? 1 : 0] }]}>
              <IconCmp size={20} color={accent.solid} weight="fill" />
            </View>
            <View style={styles.flex}>
              <Text variant="name" numberOfLines={1}>
                {habit.name}
              </Text>
              <Text variant="caption" numberOfLines={1}>
                {t(timeLabel[habit.timeOfDay])}
                {habit.target > 1 ? ` · ${habit.target} ${habit.unit ?? ''}` : ''}
              </Text>
            </View>
            {habit.reminder.enabled && <icons.bell size={16} color={colors.primary} weight="fill" />}
            <icons.caretRight size={16} color={colors.iconMuted} weight="bold" mirrored={I18nManager.isRTL} />
          </View>
        </GlassCard>
      </Pressable>
    );
  };

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn style={styles.header}>
        <View style={styles.flex}>
          <Text variant="h1">{t('habits.title')}</Text>
          <Text variant="body">{t('habits.count', { count: habits.length })}</Text>
        </View>
        <IconButton icon={icons.plus} onPress={() => router.push('/habit/new')} accessibilityLabel={t('home.addHabit')} />
      </FadeIn>

      <FadeIn index={1}>
        {showSkeleton ? (
          <ListSkeleton />
        ) : habits.length === 0 ? (
          <GlassCard radius={28}>
            <EmptyState
              icon={icons.bookOpen}
              title={t('home.emptyTitle')}
              body={t('home.emptyBody')}
              action={<Button label={t('home.addHabit')} icon={icons.plus} onPress={() => router.push('/habit/new')} />}
            />
            <QuickStart />
          </GlassCard>
        ) : (
          <View style={styles.list}>
            {habits.map((habit) => renderRow(habit))}
          </View>
        )}
      </FadeIn>

      {archived.length > 0 && (
        <FadeIn index={2} style={styles.archived}>
          <Text variant="overline" style={styles.label}>
            {t('habits.archived')}
          </Text>
          <View style={styles.list}>{archived.map((habit) => renderRow(habit, true))}</View>
        </FadeIn>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, marginBottom: t.space.xl },
  list: { gap: t.space.md },
  archived: { marginTop: t.space.xxl },
  label: { marginBottom: t.space.sm, marginStart: t.space.xs },
  dim: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, padding: t.space.md, paddingEnd: t.space.lg },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
}));
