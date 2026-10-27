import type { OutstandingNight } from '@/nights/nights';
import { payoutReminders } from '@/nights/payout-reminders';
import { describe, expect, it } from 'vitest';

const person = (name: string) => ({ playerId: name.toLowerCase(), name, colorSlot: 0 });

const friday: OutstandingNight = {
  nightId: 'n1',
  date: '2026-10-23',
  location: 'Sid’s',
  bank: person('Sid'),
  payouts: [
    { ...person('Ivy'), cents: 7000 },
    { ...person('Ann'), cents: 3000 },
  ],
};

const night = { nightId: 'n1', date: '2026-10-23', location: 'Sid’s' };

describe('payoutReminders', () => {
  it.each([
    {
      name: 'a winner sees what the bank owes them',
      viewer: 'ivy',
      expected: [{ kind: 'owed-you', ...night, bank: person('Sid'), cents: 7000 }],
    },
    {
      name: 'the bank sees everyone it still has to pay',
      viewer: 'sid',
      expected: [{ kind: 'you-owe', ...night, count: 2, cents: 10000 }],
    },
    {
      name: 'a player who is owed nothing sees no reminder',
      viewer: 'dev',
      expected: [],
    },
    {
      name: 'the host sees every bank that still owes',
      viewer: null,
      expected: [{ kind: 'bank-owes', ...night, bank: person('Sid'), count: 2, cents: 10000 }],
    },
  ])('$name', ({ viewer, expected }) => {
    expect(payoutReminders([friday], viewer)).toEqual(expected);
  });
});
