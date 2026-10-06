import type { DayKey, Frequency, Habit } from '@/types/habit';

import { fromDayKey, toDayKey } from './dates';

/** Is the habit scheduled on this calendar day? (Weekdays: 0 = Sunday … 6 = Saturday.) */
export function isDueOn(frequency: Frequency, date: Date): boolean {
  if (frequency.type === 'weekdays') return frequency.days.includes(date.getDay());
  return true; // daily (and timesPerWeek, which is shown every day)
}

/** Existed, isn't archived, and is scheduled on `day`. */
export function isActiveOn(habit: Habit, day: DayKey): boolean {
  if (habit.archived) return false;
  if (toDayKey(new Date(habit.createdAt)) > day) return false;
  return isDueOn(habit.frequency, fromDayKey(day));
}

/** Weekdays sorted Monday-first for display (0 = Sunday stays last). */
export function sortWeekdays(days: number[]): number[] {
  return [...new Set(days)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
}
