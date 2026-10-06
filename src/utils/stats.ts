import { addDays, subDays } from 'date-fns';

import type { DayKey, Habit, Logs } from '@/types/habit';

import { toDayKey } from './dates';
import { isActiveOn } from './schedule';

/** How far back streaks look (10 years). */
const MAX_DAYS = 3650;

/** Habits that existed, aren't archived and are scheduled on `day`. */
export function habitsOn(habits: Habit[], day: DayKey): Habit[] {
  return habits.filter((h) => isActiveOn(h, day));
}

export function valueOn(habit: Habit, logs: Logs, day: DayKey): number {
  return logs[habit.id]?.[day] ?? 0;
}

export function isDone(habit: Habit, logs: Logs, day: DayKey): boolean {
  return valueOn(habit, logs, day) >= habit.target;
}

export function dayProgress(habits: Habit[], logs: Logs, day: DayKey) {
  const due = habitsOn(habits, day);
  return { done: due.filter((h) => isDone(h, logs, day)).length, total: due.length };
}

/** 'perfect' = every scheduled habit done · 'missed' = something scheduled wasn't · 'rest' = nothing scheduled. */
type DayResult = 'perfect' | 'missed' | 'rest';

function dayResult(habits: Habit[], logs: Logs, day: DayKey): DayResult {
  const { done, total } = dayProgress(habits, logs, day);
  if (total === 0) return 'rest';
  return done === total ? 'perfect' : 'missed';
}

/**
 * Perfect days in a row (every scheduled habit done), counting back from today.
 * Rest days (nothing scheduled) are skipped, and an unfinished *today* doesn't break the streak yet.
 */
export function currentStreak(habits: Habit[], logs: Logs, today: Date = new Date()): number {
  const start = earliestStart(habits, today);
  if (!start) return 0;
  const first = toDayKey(start);
  let streak = 0;
  for (let i = 0; i < MAX_DAYS; i++) {
    const day = toDayKey(subDays(today, i));
    if (day < first) break;
    const result = dayResult(habits, logs, day);
    if (result === 'perfect') streak++;
    else if (result === 'missed' && i > 0) break;
  }
  return streak;
}

/** Longest run of perfect days since the first habit was created (rest days don't break it). */
export function bestStreak(habits: Habit[], logs: Logs, today: Date = new Date()): number {
  const start = earliestStart(habits, today);
  if (!start) return 0;
  let best = 0;
  let run = 0;
  for (let d = start; toDayKey(d) <= toDayKey(today); d = addDays(d, 1)) {
    const result = dayResult(habits, logs, toDayKey(d));
    if (result === 'perfect') best = Math.max(best, ++run);
    else if (result === 'missed' && toDayKey(d) !== toDayKey(today)) run = 0;
  }
  return best;
}

/** Scheduled days in a row this habit was done (same rules: skip unscheduled days, today can't break it). */
export function habitStreak(habit: Habit, logs: Logs, today: Date = new Date()): number {
  let streak = 0;
  for (let i = 0; i < MAX_DAYS; i++) {
    const day = toDayKey(subDays(today, i));
    if (!isActiveOn(habit, day)) {
      if (toDayKey(new Date(habit.createdAt)) > day) break;
      continue;
    }
    if (isDone(habit, logs, day)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

/** This habit's longest run of scheduled days done. */
export function habitBestStreak(habit: Habit, logs: Logs, today: Date = new Date()): number {
  let best = 0;
  let run = 0;
  for (let d = new Date(habit.createdAt); toDayKey(d) <= toDayKey(today); d = addDays(d, 1)) {
    const day = toDayKey(d);
    if (!isActiveOn(habit, day)) continue;
    if (isDone(habit, logs, day)) best = Math.max(best, ++run);
    else if (day !== toDayKey(today)) run = 0;
  }
  return best;
}

/** Share of scheduled habit-days completed across `days` (0–1). */
export function completionRate(habits: Habit[], logs: Logs, days: DayKey[]): number {
  let done = 0;
  let total = 0;
  for (const day of days) {
    const p = dayProgress(habits, logs, day);
    done += p.done;
    total += p.total;
  }
  return total ? done / total : 0;
}

/** One habit's completion over the scheduled days within `days`. */
export function habitRate(habit: Habit, logs: Logs, days: DayKey[]): number {
  const due = days.filter((d) => isActiveOn(habit, d));
  if (!due.length) return 0;
  return due.filter((d) => isDone(habit, logs, d)).length / due.length;
}

/** Weekday (0 = Sun) with the highest average completion over `days`, or null without data. */
export function bestWeekday(habits: Habit[], logs: Logs, days: Date[]): number | null {
  const sums = Array.from({ length: 7 }, () => ({ done: 0, total: 0 }));
  for (const date of days) {
    const p = dayProgress(habits, logs, toDayKey(date));
    sums[date.getDay()].done += p.done;
    sums[date.getDay()].total += p.total;
  }
  let best: number | null = null;
  let bestRate = 0;
  sums.forEach((s, day) => {
    const rate = s.total ? s.done / s.total : 0;
    if (s.total && rate > bestRate) {
      bestRate = rate;
      best = day;
    }
  });
  return best;
}

function earliestStart(habits: Habit[], today: Date): Date | null {
  const active = habits.filter((h) => !h.archived);
  if (!active.length) return null;
  const first = new Date(active.reduce((a, b) => (a.createdAt < b.createdAt ? a : b)).createdAt);
  const floor = subDays(today, MAX_DAYS);
  return first < floor ? floor : first;
}
