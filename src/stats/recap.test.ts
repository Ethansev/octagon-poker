import { describe, expect, it } from 'vitest';
import { recap } from '@/stats/recap';
import { standings } from '@/stats/standings';

const night = (id: string, date: string, nets: Record<string, number>) => ({
  id,
  date,
  seats: Object.entries(nets).map(([playerId, net]) => ({ playerId, buyInCents: 10000, cashOutCents: 10000 + net })),
});

describe('recap', () => {
  it('reuses the standings rule', () => {
    const nights = [night('n1', '2026-01-01', { a: 300, b: -100, c: -200 })];
    expect(recap(nights).standings).toEqual(standings(nights));
  });

  it('returns every player tied for most nights won', () => {
    const nights = [
      night('n1', '2026-01-01', { b: 100, a: -100 }),
      night('n2', '2026-01-02', { a: 100, b: -100 }),
      night('n3', '2026-01-03', { c: 0, a: 0 }),
    ];
    expect(recap(nights).mostNightsWon).toEqual({ playerIds: ['a', 'b'], count: 1 });
  });

  it('returns every player tied for the longest up-streak', () => {
    const nights = [
      night('n1', '2026-01-01', { a: 100, b: 100, c: -200 }),
      night('n2', '2026-01-02', { a: 100, b: 100, c: -200 }),
    ];
    expect(recap(nights).longestUpStreak).toEqual({ playerIds: ['a', 'b'], count: 2 });
  });

  it('finds the biggest single night', () => {
    const nights = [night('n1', '2026-01-01', { a: 100, b: -100 }), night('n2', '2026-02-01', { c: 700, a: -700 })];
    expect(recap(nights).biggestNight).toEqual({ playerId: 'c', nightId: 'n2', date: '2026-02-01', netCents: 700 });
  });

  it('is empty for a season with no closed nights', () => {
    expect(recap([])).toEqual({
      standings: { ranked: [], unranked: [] },
      mostNightsWon: null,
      biggestNight: null,
      longestUpStreak: null,
      players: [],
    });
  });

  it('has one season per player who sat, ordered by net then id', () => {
    const nights = [night('n1', '2026-01-01', { z: 100, y: 100, x: -200 }), night('n2', '2026-01-02', { w: 0, z: 0 })];
    expect(recap(nights).players.map((p) => [p.playerId, p.netCents])).toEqual([
      ['y', 100],
      ['z', 100],
      ['w', 0],
      ['x', -200],
    ]);
  });
});
