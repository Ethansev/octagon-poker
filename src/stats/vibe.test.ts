import type { PlayerSeason } from '@/stats/player-season';
import { vibe } from '@/stats/vibe';
import { describe, expect, it } from 'vitest';

const player = (nets: number[], nightsWon = 0): PlayerSeason => ({
  playerId: 'a',
  netCents: nets.reduce((sum, net) => sum + net, 0),
  nightsPlayed: nets.length,
  nightsWon,
  biggestNight: null,
  longestUpStreak: 0,
  history: nets.map((netCents, index) => ({
    nightId: `n${index}`,
    date: '2026-01-01',
    netCents,
    won: false,
  })),
});

describe('vibe', () => {
  it.each([
    {
      name: 'the season leader tops the table even on a streak',
      season: player([100, 100, 100], 3),
      rank: 1,
      expected: { kind: 'leader' },
    },
    {
      name: 'two winning nights in a row is a streak',
      season: player([-100, 100, 50]),
      rank: 2,
      expected: { kind: 'streak', count: 2 },
    },
    {
      name: 'several night wins without a streak',
      season: player([300, -100, 300, -50], 2),
      rank: 2,
      expected: { kind: 'night-winner', count: 2 },
    },
    {
      name: 'up overall with one win is in the green',
      season: player([300, -100], 1),
      rank: 3,
      expected: { kind: 'in-the-green' },
    },
    {
      name: 'exactly even',
      season: player([100, -100]),
      rank: null,
      expected: { kind: 'even' },
    },
    {
      name: 'down overall is a comeback era',
      season: player([-300, 100]),
      rank: null,
      expected: { kind: 'comeback' },
    },
  ])('$name', ({ season, rank, expected }) => {
    expect(vibe(season, rank)).toEqual(expected);
  });
});
