import { habitFromRow, habitToRow } from '@/services/api/mappers';
import type { HabitRow } from '@/types/database';

import { habit } from './fixtures';

describe('habit <-> database row', () => {
  it('round-trips every field', () => {
    const original = habit('h1', {
      name: 'Read',
      icon: 'bookOpen',
      color: 'violet',
      target: 20,
      unit: 'pages',
      timeOfDay: 'night',
      frequency: { type: 'weekdays', days: [1, 3, 5] },
      reminder: { enabled: true, hour: 21, minute: 30 },
      order: 4,
    });
    const row = { ...habitToRow(original), user_id: 'u', updated_at: '' } as HabitRow;
    expect(row.reminder_time).toBe('21:30:00');
    expect(habitFromRow(row)).toEqual(original);
  });

  it('falls back safely on unknown values from the server', () => {
    const row = {
      ...habitToRow(habit('h2')),
      icon: 'not-an-icon',
      color: 'neon',
      time_of_day: 'lunch',
      reminder_time: null,
      user_id: 'u',
      updated_at: '',
    } as HabitRow;
    const h = habitFromRow(row);
    expect(h.icon).toBe('sparkle');
    expect(h.color).toBe('blue');
    expect(h.timeOfDay).toBe('morning');
    expect(h.reminder).toEqual({ enabled: false, hour: 20, minute: 0 });
  });
});
