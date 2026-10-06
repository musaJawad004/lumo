import { useOutboxStore } from '@/store/outboxStore';

import { habit } from './fixtures';

describe('sync outbox', () => {
  beforeEach(() => useOutboxStore.getState().clear());

  it('keeps only the latest value for the same habit/day', () => {
    const { enqueue } = useOutboxStore.getState();
    enqueue({ kind: 'upsertLog', habitId: 'a', day: '2026-10-06', value: 1 });
    enqueue({ kind: 'upsertLog', habitId: 'a', day: '2026-10-06', value: 2 });
    enqueue({ kind: 'upsertLog', habitId: 'a', day: '2026-10-05', value: 1 });
    expect(useOutboxStore.getState().ops).toEqual([
      { kind: 'upsertLog', habitId: 'a', day: '2026-10-06', value: 2 },
      { kind: 'upsertLog', habitId: 'a', day: '2026-10-05', value: 1 },
    ]);
  });

  it('a newer habit save replaces the older one', () => {
    const { enqueue } = useOutboxStore.getState();
    enqueue({ kind: 'upsertHabit', habit: habit('a', { name: 'old' }) });
    enqueue({ kind: 'upsertHabit', habit: habit('a', { name: 'new' }) });
    const ops = useOutboxStore.getState().ops;
    expect(ops).toHaveLength(1);
    expect(ops[0].kind === 'upsertHabit' && ops[0].habit.name).toBe('new');
  });

  it('deleting a habit drops its pending saves and logs', () => {
    const { enqueue } = useOutboxStore.getState();
    enqueue({ kind: 'upsertHabit', habit: habit('a') });
    enqueue({ kind: 'upsertLog', habitId: 'a', day: '2026-10-06', value: 1 });
    enqueue({ kind: 'upsertLog', habitId: 'b', day: '2026-10-06', value: 1 });
    enqueue({ kind: 'deleteHabit', id: 'a' });
    expect(useOutboxStore.getState().ops).toEqual([
      { kind: 'upsertLog', habitId: 'b', day: '2026-10-06', value: 1 },
      { kind: 'deleteHabit', id: 'a' },
    ]);
  });
});
