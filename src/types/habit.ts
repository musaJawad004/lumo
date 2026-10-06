import type { IconName } from '@/constants/icons';

export type HabitId = string;
/** 'YYYY-MM-DD' in the user's local time. */
export type DayKey = string;

export type TimeOfDay = 'morning' | 'workload' | 'night';

export type HabitColor = 'blue' | 'indigo' | 'green' | 'orange' | 'violet' | 'pink' | 'teal';

export type Frequency =
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] } // 0 = Sun … 6 = Sat
  | { type: 'timesPerWeek'; count: number };

export interface HabitReminder {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface Habit {
  id: HabitId;
  name: string;
  icon: IconName;
  color: HabitColor;
  frequency: Frequency;
  /** 1 = yes/no habit; >1 = count habit ("8 glasses"). */
  target: number;
  unit?: string;
  /** Which section of Today it appears in. */
  timeOfDay: TimeOfDay;
  reminder: HabitReminder;
  order: number;
  archived: boolean;
  createdAt: string;
}

/** Fields the user edits in the habit form. */
export type HabitDraft = Pick<Habit, 'name' | 'icon' | 'color' | 'target' | 'unit' | 'timeOfDay' | 'reminder' | 'frequency'>;

/** logs[habitId][dayKey] = value (missing = 0). */
export type Logs = Record<HabitId, Record<DayKey, number>>;
