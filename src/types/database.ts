/** Row shapes of the Supabase tables (see supabase/migrations). */

export interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  language: string;
  theme: string;
  timezone: string | null;
  /** Synced app settings other than language/theme (see services/settingsSync.ts). */
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  time_of_day: string;
  target: number;
  unit: string | null;
  frequency: unknown;
  reminder_enabled: boolean;
  /** 'HH:MM:SS' */
  reminder_time: string | null;
  sort_order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLogRow {
  habit_id: string;
  user_id: string;
  /** 'YYYY-MM-DD' */
  day: string;
  value: number;
  updated_at: string;
}
