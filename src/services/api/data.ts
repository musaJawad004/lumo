import { supabase } from '@/lib/supabase';
import type { HabitLogRow, HabitRow } from '@/types/database';
import type { DayKey, Habit, HabitId, Logs } from '@/types/habit';

import { habitFromRow, habitToRow } from './mappers';

/** All of the signed-in user's habits (including archived). */
export async function fetchHabits(): Promise<Habit[]> {
  const { data, error } = await supabase.from('habits').select('*').order('sort_order');
  if (error) throw error;
  return (data as HabitRow[]).map(habitFromRow);
}

/** Logs from `since` (inclusive) onward, as the nested map the app uses. */
export async function fetchLogs(since: DayKey): Promise<Logs> {
  const { data, error } = await supabase.from('habit_logs').select('habit_id, day, value').gte('day', since);
  if (error) throw error;
  const logs: Logs = {};
  for (const row of data as Pick<HabitLogRow, 'habit_id' | 'day' | 'value'>[]) {
    (logs[row.habit_id] ??= {})[row.day] = row.value;
  }
  return logs;
}

export async function upsertHabit(habit: Habit): Promise<void> {
  const { error } = await supabase.from('habits').upsert(habitToRow(habit));
  if (error) throw error;
}

export async function deleteHabit(id: HabitId): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertLog(habitId: HabitId, day: DayKey, value: number): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .upsert({ habit_id: habitId, day, value }, { onConflict: 'habit_id,day' });
  if (error) throw error;
}
