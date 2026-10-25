import { playerSeason, seasonWinNumber } from '@/stats/player-season';
import { describe, expect, it } from 'vitest';

const night = (id: string, date: string, nets: Record<string, number>) => ({
  id,
  date,
  seats: Object.entries(nets).map(([playerId, net]) => ({
    playerId,
    buyInCents: 10000,
    cashOutCents: 10000 + net,
  })),
});

describe('playerSeason', () => {
  it('sorts history by date ascending and marks won nights', () => {
    const result = playerSeason(
      [
        night('late', '2026-03-01', { a: -100, b: 100 }),
        night('early', '2026-01-01', { a: 200, b: -200 }),
      ],
      'a',
    );
    expect(result.history).toEqual([
      { nightId: 'early', date: '2026-01-01', netCents: 200, won: true },
      { nightId: 'late', date: '2026-03-01', netCents: -100, won: false },
    ]);
    expect(result).toMatchObject({ netCents: 100, nightsPlayed: 2, nightsWon: 1 });
  });

  it('uses the biggest positive night', () => {
    const result = playerSeason(
      [
        night('n1', '2026-01-01', { a: 100, b: -100 }),
        night('n2', '2026-01-02', { a: 400, b: -400 }),
        night('n3', '2026-01-03', { a: -500, b: 500 }),
      ],
      'a',
    );
    expect(result.biggestNight).toEqual({ nightId: 'n2', date: '2026-01-02', netCents: 400 });
  });

  it('has no biggest night for a player who was never up', () => {
    const result = playerSeason(
      [night('n1', '2026-01-01', { a: -100, b: 100 }), night('n2', '2026-01-02', { a: 0, b: 0 })],
      'a',
    );
    expect(result.biggestNight).toBeNull();
  });

  it.each([
    {
      name: 'consecutive attended nights up form a streak',
      nights: [
        night('n1', '2026-01-01', { a: 100, b: -100 }),
        night('n2', '2026-01-02', { a: 100, b: -100 }),
        night('n3', '2026-01-03', { a: -300, b: 300 }),
        night('n4', '2026-01-04', { a: 100, b: -100 }),
      ],
      expected: 2,
    },
    {
      name: 'a night the player skipped does not break the streak',
      nights: [
        night('n1', '2026-01-01', { a: 100, b: -100 }),
        night('n2', '2026-01-02', { b: 100, c: -100 }),
        night('n3', '2026-01-03', { a: 100, b: -100 }),
      ],
      expected: 2,
    },
    {
      name: 'a break-even night ends the streak',
      nights: [
        night('n1', '2026-01-01', { a: 100, b: -100 }),
        night('n2', '2026-01-02', { a: 0, b: 0 }),
        night('n3', '2026-01-03', { a: 100, b: -100 }),
      ],
      expected: 1,
    },
  ])('$name', ({ nights, expected }) => {
    expect(playerSeason(nights, 'a').longestUpStreak).toBe(expected);
  });

  it('returns zeros for a player who never sat', () => {
    expect(playerSeason([night('n1', '2026-01-01', { a: 100, b: -100 })], 'ghost')).toEqual({
      playerId: 'ghost',
      netCents: 0,
      nightsPlayed: 0,
      nightsWon: 0,
      biggestNight: null,
      longestUpStreak: 0,
      history: [],
    });
  });
});

describe('seasonWinNumber', () => {
  const nights = [
    night('n3', '2026-03-01', { a: 300, b: -300 }),
    night('n1', '2026-01-01', { a: 100, b: -100 }),
    night('n2', '2026-02-01', { a: -200, b: 200 }),
    night('n4', '2026-04-01', { a: 50, b: 50, c: -100 }),
  ];

  it.each([
    { name: 'the first night won is win number one', nightId: 'n1', playerId: 'a', expected: 1 },
    { name: 'a lost night in between is not counted', nightId: 'n3', playerId: 'a', expected: 2 },
    { name: 'a shared top spot counts as a win', nightId: 'n4', playerId: 'b', expected: 2 },
    { name: 'a night the player lost has no number', nightId: 'n2', playerId: 'a', expected: null },
    { name: 'a night the player skipped has none', nightId: 'n1', playerId: 'c', expected: null },
  ])('$name', ({ nightId, playerId, expected }) => {
    expect(seasonWinNumber(nights, nightId, playerId)).toBe(expected);
  });
});
