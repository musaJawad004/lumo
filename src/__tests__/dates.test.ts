import { dayRange, fromDayKey, toDayKey } from '@/utils/dates';

import { TODAY } from './fixtures';

describe('dates', () => {
  it('formats local day keys', () => {
    expect(toDayKey(TODAY)).toBe('2026-10-06');
  });

  it('round-trips a day key without shifting the day', () => {
    for (const key of ['2026-01-01', '2026-03-29', '2026-10-25', '2026-12-31']) {
      expect(toDayKey(fromDayKey(key))).toBe(key);
    }
  });

  it('builds inclusive day ranges with offsets', () => {
    const days = dayRange(TODAY, -3, 3);
    expect(days).toHaveLength(7);
    expect(days[0]).toMatchObject({ key: '2026-10-03', offset: -3 });
    expect(days[3]).toMatchObject({ key: '2026-10-06', offset: 0 });
    expect(days[6]).toMatchObject({ key: '2026-10-09', offset: 3 });
  });

  it('crosses month boundaries', () => {
    expect(dayRange(new Date(2026, 9, 1), -1, 0).map((d) => d.key)).toEqual(['2026-09-30', '2026-10-01']);
  });
});
