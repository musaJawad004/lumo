import { useEffect } from 'react';

import { useT } from '@/i18n';
import { cancelDailyReminder, scheduleDailyReminder, syncHabitReminders } from '@/services/notifications';
import { useAuthStore } from '@/store/authStore';
import { useHabitStore } from '@/store/habitStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Keeps scheduled notifications in line with Settings and habits:
 * the general daily check-in plus one daily reminder per habit. Mount once at the root.
 */
export function useDailyReminderSync() {
  const t = useT();
  const signedIn = useAuthStore((s) => s.status === 'signedIn');
  const enabled = useSettingsStore((s) => s.reminderEnabled);
  const { hour, minute } = useSettingsStore((s) => s.reminderTime);
  const habitReminders = useSettingsStore((s) => s.habitReminders);
  const habits = useHabitStore((s) => s.habits);

  useEffect(() => {
    if (!enabled || !signedIn) {
      cancelDailyReminder();
      return;
    }
    scheduleDailyReminder({ hour, minute }, { title: t('settings.notifTitle'), body: t('settings.notifBody') }).catch(
      () => {},
    );
  }, [enabled, signedIn, hour, minute, t]);

  useEffect(() => {
    syncHabitReminders(
      habits,
      (habit) => ({ title: t('notif.habitTitle', { name: habit.name }), body: t('notif.habitBody') }),
      habitReminders && signedIn,
    ).catch(() => {});
  }, [habits, habitReminders, signedIn, t]);
}
