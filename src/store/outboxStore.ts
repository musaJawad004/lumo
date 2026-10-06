import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DayKey, Habit, HabitId } from '@/types/habit';

import { kvStorage } from './persist';

export type OutboxOp =
  | { kind: 'upsertHabit'; habit: Habit }
  | { kind: 'deleteHabit'; id: HabitId }
  | { kind: 'upsertLog'; habitId: HabitId; day: DayKey; value: number };

interface OutboxState {
  ops: OutboxOp[];
  enqueue: (op: OutboxOp) => void;
  dropFirst: () => void;
  clear: () => void;
}

/**
 * Changes waiting to reach Supabase. Persisted, so edits made offline sync later.
 * New ops replace older ones for the same record, so the queue never grows without bound.
 */
export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      ops: [],
      enqueue: (op) =>
        set((s) => {
          const ops = s.ops.filter((existing) => !supersedes(op, existing));
          return { ops: [...ops, op] };
        }),
      dropFirst: () => set((s) => ({ ops: s.ops.slice(1) })),
      clear: () => set({ ops: [] }),
    }),
    { name: 'lumo.outbox', version: 1, storage: kvStorage, partialize: ({ ops }) => ({ ops }) },
  ),
);

/** True when `next` makes `prev` pointless to send. */
function supersedes(next: OutboxOp, prev: OutboxOp): boolean {
  if (next.kind === 'upsertLog') {
    return prev.kind === 'upsertLog' && prev.habitId === next.habitId && prev.day === next.day;
  }
  const id = next.kind === 'upsertHabit' ? next.habit.id : next.id;
  if (prev.kind === 'upsertHabit') return prev.habit.id === id;
  // A delete also cancels pending log writes for that habit.
  if (next.kind === 'deleteHabit' && prev.kind === 'upsertLog') return prev.habitId === id;
  return false;
}
