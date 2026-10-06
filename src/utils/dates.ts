import { addDays, format } from 'date-fns';

import type { DayKey } from '@/types/habit';

/** 'YYYY-MM-DD' in the device's local time. */
export function toDayKey(date: Date): DayKey {
  return format(date, 'yyyy-MM-dd');
}

/** Local-midnight Date for a DayKey (never parses as UTC, so it can't shift a day). */
export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export interface DayCell {
  key: DayKey;
  date: Date;
  /** Days from today: negative = past, 0 = today, positive = future. */
  offset: number;
}

/** Consecutive days from `today + from` to `today + to`, inclusive. */
export function dayRange(today: Date, from: number, to: number): DayCell[] {
  const days: DayCell[] = [];
  for (let offset = from; offset <= to; offset++) {
    const date = addDays(today, offset);
    days.push({ key: toDayKey(date), date, offset });
  }
  return days;
}
