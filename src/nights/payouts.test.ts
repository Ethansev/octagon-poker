import { payoutPlan } from '@/nights/payouts';
import { describe, expect, it } from 'vitest';

const paidAt = new Date('2026-10-24T08:00:00Z');

const seat = (playerName: string, cashOutCents: number | null, paidOutAt: Date | null = null) => ({
  playerId: playerName.toLowerCase(),
  playerName,
  playerColorSlot: 0,
  cashOutCents,
  paidOutAt,
});

describe('payoutPlan', () => {
  it.each([
    {
      name: 'no bank was picked',
      bank: null,
      seats: [seat('Sid', 4000), seat('Ivy', 0)],
      expected: null,
    },
    {
      name: 'the bank left the table',
      bank: 'dev',
      seats: [seat('Sid', 4000)],
      expected: null,
    },
    {
      name: 'the bank owes the winners and keeps its own cash-out',
      bank: 'sid',
      seats: [seat('Sid', 2500), seat('Ivy', 7000), seat('Dev', 0), seat('Ann', 3000)],
      expected: {
        bank: { playerId: 'sid', name: 'Sid', colorSlot: 0, keepsCents: 2500 },
        payouts: [
          { playerId: 'ivy', name: 'Ivy', colorSlot: 0, cents: 7000, paid: false },
          { playerId: 'ann', name: 'Ann', colorSlot: 0, cents: 3000, paid: false },
        ],
        owedCents: 10000,
        leftCents: 10000,
      },
    },
    {
      name: 'paid rows sink below the ones still owed',
      bank: 'sid',
      seats: [seat('Sid', 0), seat('Ivy', 7000, paidAt), seat('Ann', 3000)],
      expected: {
        bank: { playerId: 'sid', name: 'Sid', colorSlot: 0, keepsCents: 0 },
        payouts: [
          { playerId: 'ann', name: 'Ann', colorSlot: 0, cents: 3000, paid: false },
          { playerId: 'ivy', name: 'Ivy', colorSlot: 0, cents: 7000, paid: true },
        ],
        owedCents: 10000,
        leftCents: 3000,
      },
    },
  ])('$name', ({ bank, seats, expected }) => {
    expect(payoutPlan(seats, bank)).toEqual(expected);
  });
});
