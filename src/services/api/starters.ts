import { habitIcons, type IconName } from '@/constants/icons';
import { supabase } from '@/lib/supabase';
import type { HabitColor, TimeOfDay } from '@/types/habit';

/** A starter habit from `public.starter_habits`, already resolved to one language. */
export interface StarterHabit {
  id: string;
  name: string;
  icon: IconName;
  color: HabitColor;
  timeOfDay: TimeOfDay;
  target: number;
  unit?: string;
}

interface StarterRow {
  id: string;
  name: string;
  translations: Record<string, string> | null;
  icon: string;
  color: string;
  time_of_day: TimeOfDay;
  target: number;
  unit: string | null;
  unit_translations: Record<string, string> | null;
}

const COLORS: HabitColor[] = ['blue', 'indigo', 'green', 'orange', 'violet', 'pink', 'teal'];

/** Active starter habits (managed in Supabase → Table Editor → starter_habits), named in `language`. */
export async function fetchStarterHabits(language: string): Promise<StarterHabit[]> {
  const { data, error } = await supabase
    .from('starter_habits')
    .select('id, name, translations, icon, color, time_of_day, target, unit, unit_translations')
    .order('sort_order');
  if (error) throw error;
  return (data as StarterRow[]).map((row) => ({
    id: row.id,
    name: row.translations?.[language] || row.name,
    icon: (habitIcons as string[]).includes(row.icon) ? (row.icon as IconName) : 'sparkle',
    color: COLORS.includes(row.color as HabitColor) ? (row.color as HabitColor) : 'blue',
    timeOfDay: row.time_of_day,
    target: row.target,
    unit: (row.unit_translations?.[language] || row.unit) ?? undefined,
  }));
}
