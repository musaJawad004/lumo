import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Habit, HabitId } from '@/types/habit';

import { kvStorage } from './persist';

interface HabitState {
  habits: Habit[];
  replaceAll: (habits: Habit[]) => void;
  upsert: (habit: Habit) => void;
  remove: (id: HabitId) => void;
  clear: () => void;
}

/** Local copy of the user's habits. Mutations go through services/habits.ts so they also sync. */
export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      replaceAll: (habits) => set({ habits }),
      upsert: (habit) =>
        set((s) => {
          const exists = s.habits.some((h) => h.id === habit.id);
          return { habits: exists ? s.habits.map((h) => (h.id === habit.id ? habit : h)) : [...s.habits, habit] };
        }),
      remove: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      clear: () => set({ habits: [] }),
    }),
    { name: 'lumo.habits', version: 2, storage: kvStorage, partialize: ({ habits }) => ({ habits }), migrate: () => ({ habits: [] }) },
  ),
);
