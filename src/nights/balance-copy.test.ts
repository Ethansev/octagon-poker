import { balanceNote, closeBlockedReason } from '@/nights/balance-copy';
import { nightBalance } from '@/stats/nights';
import { describe, expect, it } from 'vitest';

const seat = (playerName: string, buyInCents: number, cashOutCents: number | null) => ({
  playerId: playerName.toLowerCase(),
  playerName,
  buyInCents,
  cashOutCents,
});

const cases = [
  {
    name: 'a night with nobody seated',
    seats: [],
    note: 'No players yet',
    blocked: 'Add players before closing the night.',
  },
  {
    name: 'two players still at the table',
    seats: [seat('Sid', 2000, null), seat('Ivy', 2000, null), seat('Dev', 2000, 4000)],
    note: 'Waiting on Sid and Ivy',
    blocked: "Can't close yet: waiting on a cash-out from Sid and Ivy.",
  },
  {
    name: 'cash-outs come up short of the buy-ins',
    seats: [seat('Sid', 6000, 2000), seat('Ivy', 2000, 2000)],
    note: 'Cash-outs are $40 short of buy-ins',
    blocked: "Can't close yet: cash-outs are $40 short of buy-ins.",
  },
  {
    name: 'cash-outs run over the buy-ins',
    seats: [seat('Sid', 2000, 3000), seat('Ivy', 2000, 1500)],
    note: 'Cash-outs are $5 over buy-ins',
    blocked: "Can't close yet: cash-outs are $5 over buy-ins.",
  },
  {
    name: 'books that balance to the dollar',
    seats: [seat('Sid', 2000, 3000), seat('Ivy', 2000, 1000)],
    note: 'All counted',
    blocked: null,
  },
];

describe('balanceNote', () => {
  it.each(cases)('$name', ({ seats, note }) => {
    expect(balanceNote(nightBalance(seats), seats)).toBe(note);
  });
});

describe('closeBlockedReason', () => {
  it.each(cases)('$name', ({ seats, blocked }) => {
    expect(closeBlockedReason(seats)).toBe(blocked);
  });
});
