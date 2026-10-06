import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DayKey, HabitId, Logs } from '@/types/habit';

import { kvStorage } from './persist';

interface LogState {
  logs: Logs;
  replaceAll: (logs: Logs) => void;
  setValue: (habitId: HabitId, day: DayKey, value: number) => void;
  removeHabit: (habitId: HabitId) => void;
  clear: () => void;
}

/** Progress per habit per day. Mutations go through services/habits.ts so they also sync. */
export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      logs: {},
      replaceAll: (logs) => set({ logs }),
      setValue: (habitId, day, value) =>
        set((s) => ({ logs: { ...s.logs, [habitId]: { ...s.logs[habitId], [day]: value } } })),
      removeHabit: (habitId) =>
        set((s) => {
          const { [habitId]: _removed, ...rest } = s.logs;
          return { logs: rest };
        }),
      clear: () => set({ logs: {} }),
    }),
    { name: 'lumo.logs', version: 1, storage: kvStorage, partialize: ({ logs }) => ({ logs }) },
  ),
);
