import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { GlassView } from '@/components/glass/GlassView';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { habitColors } from '@/constants/habitColors';
import { icons } from '@/constants/icons';
import { useLanguage, useT } from '@/i18n';
import { fetchStarterHabits, type StarterHabit } from '@/services/api/starters';
import { createFromStarter } from '@/services/habits';
import { makeStyles, useTheme } from '@/theme';

/**
 * One-tap suggestions loaded from the backend (`public.starter_habits`), so they can be
 * changed in Supabase without an app update. Hidden when offline or when the list is empty.
 */
export function QuickStart() {
  const t = useT();
  const language = useLanguage();
  const { colors, isDark } = useTheme();
  const styles = useStyles();
  const [starters, setStarters] = useState<StarterHabit[]>([]);
  const [added, setAdded] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetchStarterHabits(language.code)
      .then((list) => alive && setStarters(list))
      .catch((error) => console.warn('[starters] could not load suggestions', error));
    return () => {
      alive = false;
    };
  }, [language.code]);

  const remaining = starters.filter((s) => !added.includes(s.id));
  if (remaining.length === 0) return null;

  const add = (starter: StarterHabit) => {
    createFromStarter(starter);
    setAdded((a) => [...a, starter.id]);
  };

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.root}>
      <Text variant="overline" style={styles.label}>
        {t('home.quickStart')}
      </Text>
      <View style={styles.grid}>
        {remaining.map((starter) => {
          const IconCmp = icons[starter.icon];
          const accent = habitColors[starter.color];
          return (
            <Animated.View key={starter.id} layout={LinearTransition.duration(220)} exiting={FadeOut.duration(150)}>
              <Pressable
                onPress={() => add(starter)}
                haptic="success"
                scaleTo={0.94}
                accessibilityLabel={`${t('home.addHabit')}: ${starter.name}`}
                style={styles.chip}
              >
                <GlassView
                  intensity={30}
                  bordered={false}
                  fill={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.icon, { backgroundColor: accent.soft[isDark ? 1 : 0] }]}>
                  <IconCmp size={15} color={accent.solid} weight="fill" />
                </View>
                <Text variant="chip" color="text" numberOfLines={1}>
                  {starter.name}
                </Text>
                <icons.plus size={13} color={colors.primary} weight="bold" />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { marginTop: t.space.sm, alignSelf: 'stretch' },
  label: { marginBottom: t.space.md, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.sm,
    paddingStart: 5,
    paddingEnd: t.space.md,
    paddingVertical: 5,
    borderRadius: t.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
  },
  icon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
}));
