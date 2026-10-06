import type { Frequency, Habit, Logs } from '@/types/habit';

/** Fixed "today" so tests never depend on the real date: Tuesday 6 Oct 2026, local noon. */
export const TODAY = new Date(2026, 9, 6, 12);

export function habit(id: string, over: Partial<Habit> = {}): Habit {
  return {
    id,
    name: id,
    icon: 'drop',
    color: 'blue',
    frequency: { type: 'daily' } as Frequency,
    target: 1,
    timeOfDay: 'morning',
    reminder: { enabled: false, hour: 8, minute: 0 },
    order: 0,
    archived: false,
    createdAt: new Date(2026, 8, 1, 9).toISOString(), // 1 Sep 2026
    ...over,
  };
}

/** logs from a compact spec: { habitId: { 'YYYY-MM-DD': value } } */
export const logs = (spec: Logs): Logs => spec;
