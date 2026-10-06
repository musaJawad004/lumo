import * as Notifications from 'expo-notifications';

import type { Habit } from '@/types/habit';
import type { ReminderTime } from '@/types/settings';

const DAILY_ID = 'lumo.daily-reminder';
const HABIT_PREFIX = 'lumo.habit.';

// Show reminders as a banner even when Lumo is open. Lumo is silent: reminders never play a sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Asks only if the user hasn't answered yet. Returns whether we may notify. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

async function hasPermission() {
  return (await Notifications.getPermissionsAsync()).granted;
}

function daily(time: ReminderTime): Notifications.NotificationTriggerInput {
  return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: time.hour, minute: time.minute };
}

// ───────────── general daily check-in ─────────────

/** Replaces any existing daily check-in with one at `time`. */
export async function scheduleDailyReminder(time: ReminderTime, content: { title: string; body: string }) {
  await cancelDailyReminder();
  if (!(await hasPermission())) return;
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: { ...content, sound: false },
    trigger: daily(time),
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
}

// ───────────── per-habit reminders ─────────────

/**
 * Makes the scheduled notifications match `habits` exactly: one daily reminder per active habit
 * that has its reminder on. Cheap to call whenever habits or language change.
 */
export async function syncHabitReminders(
  habits: Habit[],
  content: (habit: Habit) => { title: string; body: string },
  enabled: boolean,
) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(HABIT_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!enabled || !(await hasPermission())) return;

  const requests = habits
    .filter((h) => !h.archived && h.reminder.enabled)
    .flatMap((h) => {
      const base = { content: { ...content(h), sound: false, data: { habitId: h.id } } };
      // Weekday habits: one weekly reminder per scheduled day (expo weekday: 1 = Sunday … 7 = Saturday).
      if (h.frequency.type === 'weekdays') {
        return h.frequency.days.map((day) => ({
          ...base,
          identifier: `${HABIT_PREFIX}${h.id}.${day}`,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1,
            hour: h.reminder.hour,
            minute: h.reminder.minute,
          } as Notifications.NotificationTriggerInput,
        }));
      }
      return [{ ...base, identifier: `${HABIT_PREFIX}${h.id}`, trigger: daily(h.reminder) }];
    });
  await Promise.all(requests.map((r) => Notifications.scheduleNotificationAsync(r)));
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
