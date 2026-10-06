import { randomUUID } from 'expo-crypto';

import type { StarterHabit } from '@/services/api/starters';
import { useHabitStore } from '@/store/habitStore';
import { useLogStore } from '@/store/logStore';
import { useOutboxStore } from '@/store/outboxStore';
import type { DayKey, Habit, HabitDraft, HabitId } from '@/types/habit';

import { flushOutbox } from './sync';

/**
 * All habit writes go through here: update the local store immediately (instant UI),
 * queue the change for Supabase, then try to send it.
 */

export function createHabit(draft: HabitDraft): Habit {
  const habits = useHabitStore.getState().habits;
  const habit: Habit = {
    ...draft,
    id: randomUUID(),
    name: draft.name.trim(),
    order: habits.length ? Math.max(...habits.map((h) => h.order)) + 1 : 0,
    archived: false,
    createdAt: new Date().toISOString(),
  };
  save(habit);
  return habit;
}

/** Adds one of the backend's starter habits (already localized) to the user's habits. */
export function createFromStarter(starter: StarterHabit): Habit {
  return createHabit({
    name: starter.name,
    icon: starter.icon,
    color: starter.color,
    target: starter.target,
    unit: starter.unit,
    timeOfDay: starter.timeOfDay,
    frequency: { type: 'daily' },
    reminder: { enabled: false, hour: 8, minute: 0 },
  });
}

export function updateHabit(id: HabitId, patch: Partial<HabitDraft> & { archived?: boolean }) {
  const current = useHabitStore.getState().habits.find((h) => h.id === id);
  if (!current) return;
  save({ ...current, ...patch, name: (patch.name ?? current.name).trim() });
}

export function removeHabit(id: HabitId) {
  useHabitStore.getState().remove(id);
  useLogStore.getState().removeHabit(id);
  useOutboxStore.getState().enqueue({ kind: 'deleteHabit', id });
  flushOutbox();
}

export function setLogValue(habitId: HabitId, day: DayKey, value: number) {
  useLogStore.getState().setValue(habitId, day, value);
  useOutboxStore.getState().enqueue({ kind: 'upsertLog', habitId, day, value });
  flushOutbox();
}

/** Tap behaviour: count habits step up and wrap to 0 after the target; yes/no habits toggle. */
export function nextLogValue(habit: Habit, current: number): number {
  if (current >= habit.target) return 0;
  return habit.target > 1 ? current + 1 : habit.target;
}

function save(habit: Habit) {
  useHabitStore.getState().upsert(habit);
  useOutboxStore.getState().enqueue({ kind: 'upsertHabit', habit });
  flushOutbox();
}
