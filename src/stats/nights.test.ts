import { nightBalance, nightPot, nightWinners, seatNet } from '@/stats/nights';
import { describe, expect, it } from 'vitest';

const seat = (playerId: string, net: number) => ({
  playerId,
  buyInCents: 10000,
  cashOutCents: 10000 + net,
});

describe('seatNet', () => {
  it('is cash-out minus buy-in', () => {
    expect(seatNet({ playerId: 'a', buyInCents: 2000, cashOutCents: 500 })).toBe(-1500);
  });
});

describe('nightPot', () => {
  it.each([
    { name: 'an empty night has no pot', seats: [], expected: 0 },
    {
      name: 'the pot is every buy-in added up',
      seats: [
        { playerId: 'a', buyInCents: 2000, cashOutCents: 0 },
        { playerId: 'b', buyInCents: 3500, cashOutCents: 5500 },
      ],
      expected: 5500,
    },
  ])('$name', ({ seats, expected }) => {
    expect(nightPot(seats)).toBe(expected);
  });
});

describe('nightWinners', () => {
  it.each([
    {
      name: 'a single top net wins alone',
      seats: [seat('a', 500), seat('b', 200), seat('c', -700)],
      expected: ['a'],
    },
    {
      name: 'a tie at the top produces co-winners',
      seats: [seat('a', 500), seat('b', 500), seat('c', -1000)],
      expected: ['a', 'b'],
    },
    {
      name: 'a night where nobody is up has no winner',
      seats: [seat('a', 0), seat('b', 0)],
      expected: [],
    },
    { name: 'a night with no seats has no winner', seats: [], expected: [] },
  ])('$name', ({ seats, expected }) => {
    expect(nightWinners(seats)).toEqual(expected);
  });
});

describe('nightBalance', () => {
  it.each([
    { name: 'no seats is empty', seats: [], expected: { kind: 'empty' } },
    {
      name: 'a seat without a cash-out is reported by id',
      seats: [{ playerId: 'a', buyInCents: 2000, cashOutCents: null }, seat('b', 0)],
      expected: { kind: 'missing-cash-out', playerIds: ['a'] },
    },
    {
      name: 'cash-out short of buy-in is off',
      seats: [
        { playerId: 'a', buyInCents: 3000, cashOutCents: 2800 },
        { playerId: 'b', buyInCents: 3000, cashOutCents: 3000 },
      ],
      expected: { kind: 'off', inCents: 6000, outCents: 5800 },
    },
    {
      name: 'cash-out equal to buy-in is balanced',
      seats: [seat('a', 500), seat('b', -500)],
      expected: { kind: 'balanced', totalCents: 20000 },
    },
  ])('$name', ({ seats, expected }) => {
    expect(nightBalance(seats)).toEqual(expected);
  });
});
