import { habitIcons, type IconName } from '@/constants/icons';
import type { HabitRow } from '@/types/database';
import type { Frequency, Habit, HabitColor, TimeOfDay } from '@/types/habit';

const COLORS: HabitColor[] = ['blue', 'indigo', 'green', 'orange', 'violet', 'pink', 'teal'];
const TIMES: TimeOfDay[] = ['morning', 'workload', 'night'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Server row → app model. Unknown values fall back to safe defaults instead of crashing. */
export function habitFromRow(row: HabitRow): Habit {
  const [hour = '20', minute = '0'] = (row.reminder_time ?? '20:00').split(':');
  return {
    id: row.id,
    name: row.name,
    icon: (habitIcons as string[]).includes(row.icon) ? (row.icon as IconName) : 'sparkle',
    color: COLORS.includes(row.color as HabitColor) ? (row.color as HabitColor) : 'blue',
    frequency: (row.frequency as Frequency) ?? { type: 'daily' },
    target: row.target,
    unit: row.unit ?? undefined,
    timeOfDay: TIMES.includes(row.time_of_day as TimeOfDay) ? (row.time_of_day as TimeOfDay) : 'morning',
    reminder: { enabled: row.reminder_enabled, hour: Number(hour), minute: Number(minute) },
    order: row.sort_order,
    archived: row.archived,
    createdAt: row.created_at,
  };
}

/** App model → columns we write (user_id is filled by the database default). */
export function habitToRow(habit: Habit) {
  return {
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    target: habit.target,
    unit: habit.unit ?? null,
    time_of_day: habit.timeOfDay,
    reminder_enabled: habit.reminder.enabled,
    reminder_time: `${pad(habit.reminder.hour)}:${pad(habit.reminder.minute)}:00`,
    sort_order: habit.order,
    archived: habit.archived,
    created_at: habit.createdAt,
  };
}
