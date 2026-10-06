import { isActiveOn, isDueOn, sortWeekdays } from '@/utils/schedule';

import { habit } from './fixtures';

describe('schedule', () => {
  it('daily habits are due every day', () => {
    expect(isDueOn({ type: 'daily' }, new Date(2026, 9, 4))).toBe(true); // Sunday
  });

  it('weekday habits are due only on chosen days', () => {
    const weekdays = { type: 'weekdays' as const, days: [1, 3, 5] }; // Mon, Wed, Fri
    expect(isDueOn(weekdays, new Date(2026, 9, 5))).toBe(true); // Monday
    expect(isDueOn(weekdays, new Date(2026, 9, 6))).toBe(false); // Tuesday
  });

  it('is not active before creation or when archived', () => {
    const h = habit('a', { createdAt: new Date(2026, 9, 5, 18).toISOString() });
    expect(isActiveOn(h, '2026-10-04')).toBe(false);
    expect(isActiveOn(h, '2026-10-05')).toBe(true);
    expect(isActiveOn({ ...h, archived: true }, '2026-10-06')).toBe(false);
  });

  it('sorts weekdays Monday-first and drops duplicates', () => {
    expect(sortWeekdays([0, 3, 1, 3, 6])).toEqual([1, 3, 6, 0]);
  });
});
