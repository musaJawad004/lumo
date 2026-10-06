import { subDays } from 'date-fns';

import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useHabitStore } from '@/store/habitStore';
import { useLogStore } from '@/store/logStore';
import { useOutboxStore, type OutboxOp } from '@/store/outboxStore';
import { toDayKey } from '@/utils/dates';

import { deleteHabit, fetchHabits, fetchLogs, upsertHabit, upsertLog } from './api/data';

/** How far back logs are downloaded on sign-in. */
const HISTORY_DAYS = 180;

let flushing: Promise<void> | null = null;

function isNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /network|fetch|timeout|offline|Failed to fetch/i.test(message);
}

async function send(op: OutboxOp) {
  if (op.kind === 'upsertHabit') return upsertHabit(op.habit);
  if (op.kind === 'deleteHabit') return deleteHabit(op.id);
  return upsertLog(op.habitId, op.day, op.value);
}

/**
 * Sends queued changes in order. Stops on network errors (retried later);
 * drops an op the server rejects so one bad record can't block the queue.
 */
export function flushOutbox(): Promise<void> {
  if (!isSupabaseConfigured || useAuthStore.getState().status !== 'signedIn') return Promise.resolve();
  flushing ??= (async () => {
    try {
      for (;;) {
        const op = useOutboxStore.getState().ops[0];
        if (!op) break;
        try {
          await send(op);
          useOutboxStore.getState().dropFirst();
        } catch (error) {
          if (isNetworkError(error)) break;
          console.warn('[sync] server rejected change, skipping', op.kind, error);
          useOutboxStore.getState().dropFirst();
        }
      }
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}

/** Push local changes first, then replace local data with the server's copy. */
export async function pullFromServer(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await flushOutbox();
  if (useOutboxStore.getState().ops.length > 0) return; // still offline: keep local state
  const since = toDayKey(subDays(new Date(), HISTORY_DAYS));
  const [habits, logs] = await Promise.all([fetchHabits(), fetchLogs(since)]);
  useHabitStore.getState().replaceAll(habits);
  useLogStore.getState().replaceAll(logs);
}

/** Wipes everything user-specific from the device (sign-out / account switch). */
export function clearLocalUserData() {
  useHabitStore.getState().clear();
  useLogStore.getState().clear();
  useOutboxStore.getState().clear();
}
