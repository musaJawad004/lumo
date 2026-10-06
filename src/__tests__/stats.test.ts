import {
  bestStreak,
  bestWeekday,
  completionRate,
  currentStreak,
  dayProgress,
  habitBestStreak,
  habitRate,
  habitStreak,
} from '@/utils/stats';
import { dayRange } from '@/utils/dates';

import { TODAY, habit, logs } from './fixtures';

const daily = habit('water', { target: 2 });
const read = habit('read');

describe('dayProgress', () => {
  it('counts habits that reached their target', () => {
    const l = logs({ water: { '2026-10-06': 2 }, read: { '2026-10-06': 0 } });
    expect(dayProgress([daily, read], l, '2026-10-06')).toEqual({ done: 1, total: 2 });
  });

  it('a count habit below target is not done', () => {
    expect(dayProgress([daily], logs({ water: { '2026-10-06': 1 } }), '2026-10-06').done).toBe(0);
  });
});

describe('currentStreak', () => {
  const perfect = (keys: string[]) => logs({ read: Object.fromEntries(keys.map((k) => [k, 1])) });

  it('counts consecutive perfect days up to today', () => {
    expect(currentStreak([read], perfect(['2026-10-04', '2026-10-05', '2026-10-06']), TODAY)).toBe(3);
  });

  it('an unfinished today does not break the streak', () => {
    expect(currentStreak([read], perfect(['2026-10-04', '2026-10-05']), TODAY)).toBe(2);
  });

  it('a missed day breaks it', () => {
    expect(currentStreak([read], perfect(['2026-10-03', '2026-10-05']), TODAY)).toBe(1);
  });

  it('rest days (nothing scheduled) are skipped, not counted as misses', () => {
    const weekdaysOnly = habit('gym', { frequency: { type: 'weekdays', days: [1, 2, 3, 4, 5] } });
    // Fri 2 Oct, Mon 5 Oct, Tue 6 Oct done; Sat/Sun are rest days.
    const l = logs({ gym: { '2026-10-02': 1, '2026-10-05': 1, '2026-10-06': 1 } });
    expect(currentStreak([weekdaysOnly], l, TODAY)).toBe(3);
  });

  it('is 0 without habits', () => {
    expect(currentStreak([], {}, TODAY)).toBe(0);
  });
});

describe('bestStreak', () => {
  it('finds the longest perfect run in history', () => {
    const l = logs({ read: { '2026-09-10': 1, '2026-09-11': 1, '2026-09-12': 1, '2026-09-20': 1 } });
    expect(bestStreak([read], l, TODAY)).toBe(3);
  });
});

describe('habit streaks', () => {
  const mwf = habit('run', { frequency: { type: 'weekdays', days: [1, 3, 5] } });

  it('skips unscheduled days', () => {
    // Wed 30 Sep, Fri 2 Oct, Mon 5 Oct done; Tue 6 Oct isn't scheduled.
    const l = logs({ run: { '2026-09-30': 1, '2026-10-02': 1, '2026-10-05': 1 } });
    expect(habitStreak(mwf, l, TODAY)).toBe(3);
  });

  it('best streak per habit', () => {
    const l = logs({ read: { '2026-09-01': 1, '2026-09-02': 1, '2026-09-04': 1 } });
    expect(habitBestStreak(read, l, TODAY)).toBe(2);
  });
});

describe('rates', () => {
  const week = dayRange(TODAY, -6, 0).map((d) => d.key);

  it('completion rate over a period', () => {
    const l = logs({ read: { [week[0]]: 1, [week[1]]: 1, [week[2]]: 1 } });
    expect(completionRate([read], l, week)).toBeCloseTo(3 / 7);
  });

  it('habit rate only counts scheduled days', () => {
    const weekend = habit('hike', { frequency: { type: 'weekdays', days: [0, 6] } });
    const l = logs({ hike: { '2026-10-03': 1 } }); // Saturday done, Sunday not
    expect(habitRate(weekend, l, week)).toBe(0.5);
  });

  it('best weekday', () => {
    const l = logs({ read: { '2026-10-01': 1 } }); // a Thursday
    expect(bestWeekday([read], l, dayRange(TODAY, -6, 0).map((d) => d.date))).toBe(4);
  });
});
