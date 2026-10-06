import { useEffect, useState } from 'react';
import { I18nManager, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Checkbox } from '@/components/ui/Checkbox';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { habitColors } from '@/constants/habitColors';
import { icons } from '@/constants/icons';
import { makeStyles, useTheme } from '@/theme';
import type { Habit, HabitId } from '@/types/habit';

interface Props {
  title: string;
  habits: Habit[];
  values: Record<HabitId, number>;
  onLog: (habit: Habit) => void;
  /** Long press opens the habit for editing. */
  onEdit?: (habit: Habit) => void;
  /** Future days can be viewed but not logged. */
  readOnly?: boolean;
}

const layout = LinearTransition.duration(260);

/** Collapsible group ("Morning", "Workload", "Night") of checkable habit rows. */
export function HabitSection({ title, habits, values, onLog, onEdit, readOnly }: Props) {
  const { colors, motion } = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(true);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withTiming(open ? 0 : I18nManager.isRTL ? 90 : -90, { duration: motion.release }));
  }, [open, rotation, motion.release]);

  const caretStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const doneCount = habits.filter((h) => (values[h.id] ?? 0) >= h.target).length;

  return (
    <Animated.View layout={layout} entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        scaleTo={1}
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}, ${doneCount} of ${habits.length} done`}
        style={styles.header}
      >
        <Animated.View style={caretStyle}>
          <icons.caretDown size={12} color={colors.text} weight="fill" />
        </Animated.View>
        <Text variant="h2" style={styles.title}>
          {title}
        </Text>
        <Text variant="caption" tabular>
          {doneCount}/{habits.length}
        </Text>
      </Pressable>

      {open &&
        habits.map((habit) => {
          const value = values[habit.id] ?? 0;
          const done = value >= habit.target;
          const IconCmp = icons[habit.icon];
          return (
            <Animated.View key={habit.id} layout={layout} entering={FadeIn.duration(200)} exiting={FadeOut.duration(140)}>
              <Pressable
                onPress={() => (readOnly ? onEdit?.(habit) : onLog(habit))}
                onLongPress={() => onEdit?.(habit)}
                delayLongPress={350}
                haptic={done ? 'selection' : value + 1 >= habit.target ? 'success' : 'light'}
                scaleTo={0.98}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityHint={onEdit ? 'Long press to edit' : undefined}
                accessibilityLabel={habit.target > 1 ? `${habit.name}, ${value} of ${habit.target}` : habit.name}
                style={[styles.row, readOnly && styles.readOnly]}
              >
                <Checkbox checked={done} />
                <IconCmp size={18} color={habitColors[habit.color].solid} weight="fill" />
                <Text variant="label" color={done ? 'textMuted' : 'text'} numberOfLines={1} style={styles.name}>
                  {habit.name}
                </Text>
                {habit.target > 1 && (
                  <View style={[styles.count, done && styles.countDone]}>
                    <Text variant="caption" color={done ? 'primary' : 'textBody'} tabular>
                      {value}/{habit.target}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm, paddingVertical: t.space.sm },
  title: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.space.md,
    paddingVertical: 10,
    paddingLeft: t.space.xl,
  },
  name: { flex: 1 },
  readOnly: { opacity: 0.55 },
  count: { paddingHorizontal: t.space.sm, paddingVertical: 2, borderRadius: 999, backgroundColor: t.colors.tile },
  countDone: { backgroundColor: t.colors.primarySoft },
}));
