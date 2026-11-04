import { contactStats } from '@/app/(group)/players/contact-stats';
import type { ClosedNight } from '@/stats/nights';
import { describe, expect, it } from 'vitest';

const night = (id: string, seats: { playerId: string; net: number }[]): ClosedNight => ({
  id,
  date: `2026-01-0${id}`,
  seats: seats.map(({ playerId, net }) => ({
    playerId,
    buyInCents: 2000,
    cashOutCents: 2000 + net,
  })),
});

const nights = [
  night('1', [
    { playerId: 'ivy', net: 3000 },
    { playerId: 'sid', net: -3000 },
  ]),
  night('2', [
    { playerId: 'ivy', net: -500 },
    { playerId: 'sid', net: 500 },
  ]),
  night('3', [
    { playerId: 'ivy', net: 0 },
    { playerId: 'sid', net: 0 },
  ]),
];

describe('contactStats', () => {
  it.each([
    {
      name: 'counts up and down nights, leaving a break-even night out of both',
      playerId: 'ivy',
      expected: { nightsPlayed: 3, nightsWon: 1, upNights: 1, downNights: 1, netCents: 2500 },
    },
    {
      name: 'gives a player who never sat down all zeroes',
      playerId: 'dev',
      expected: { nightsPlayed: 0, nightsWon: 0, upNights: 0, downNights: 0, netCents: 0 },
    },
  ])('$name', ({ playerId, expected }) => {
    expect(contactStats(nights, playerId)).toEqual(expected);
  });
});
