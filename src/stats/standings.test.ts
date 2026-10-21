import { describe, expect, it } from 'vitest';
import { standings } from '@/stats/standings';

const night = (id: string, date: string, nets: Record<string, number>) => ({
  id,
  date,
  seats: Object.entries(nets).map(([playerId, net]) => ({ playerId, buyInCents: 10000, cashOutCents: 10000 + net })),
});

describe('standings', () => {
  const season = [
    night('n1', '2026-01-10', { sid: 300, ivy: 100, dev: -200, tyler: -200 }),
    night('n2', '2026-02-14', { sid: 112, ivy: 165, ethan: 140, marco: 38, priya: -55, johnny: -180, tyler: -60, dev: -160 }),
  ];

  it('ranks players who are up by net', () => {
    expect(standings(season).ranked.map((s) => [s.playerId, s.netCents])).toEqual([
      ['sid', 412],
      ['ivy', 265],
      ['ethan', 140],
      ['marco', 38],
    ]);
  });

  it('lists everyone at or below zero unranked, closest to zero first', () => {
    expect(standings(season).unranked.map((s) => s.playerId)).toEqual(['priya', 'johnny', 'tyler', 'dev']);
  });

  it('counts nights played and won', () => {
    const sid = standings(season).ranked.find((s) => s.playerId === 'sid');
    expect(sid).toEqual({ playerId: 'sid', netCents: 412, nightsPlayed: 2, nightsWon: 1 });
  });

  it('puts a player at exactly zero in unranked', () => {
    const result = standings([night('n1', '2026-01-01', { a: 100, b: 0, c: -100 })]);
    expect(result.ranked.map((s) => s.playerId)).toEqual(['a']);
    expect(result.unranked.map((s) => s.playerId)).toEqual(['b', 'c']);
  });

  it('breaks unranked ties on player id', () => {
    const result = standings([night('n1', '2026-01-01', { z: -50, a: -50, w: 100 })]);
    expect(result.unranked.map((s) => s.playerId)).toEqual(['a', 'z']);
  });

  it.each([
    {
      name: 'equal net goes to the player who won more nights',
      nights: [
        night('n1', '2026-01-01', { z: 300, w: -300 }),
        night('n2', '2026-01-02', { z: -100, w: 100 }),
        night('n3', '2026-01-03', { a: 100, v: 200, w: -300 }),
        night('n4', '2026-01-04', { a: 100, v: 200, w: -300 }),
      ],
      expected: ['v', 'z', 'a'],
    },
    {
      name: 'equal net and wins goes to the player with fewer nights played',
      nights: [
        night('n1', '2026-01-01', { b: 100, w: -100 }),
        night('n2', '2026-01-02', { a: 300, w: -300 }),
        night('n3', '2026-01-03', { a: -200, w: 200 }),
      ],
      expected: ['b', 'a'],
    },
    {
      name: 'a full tie goes to the lower player id',
      nights: [night('n1', '2026-01-01', { c: 100, b: 100, w: -200 })],
      expected: ['b', 'c'],
    },
  ])('$name', ({ nights, expected }) => {
    expect(standings(nights).ranked.map((s) => s.playerId)).toEqual(expected);
  });

  it('credits both co-winners with the night', () => {
    const result = standings([night('n1', '2026-01-01', { a: 100, b: 100, c: -200 })]);
    expect(result.ranked.map((s) => [s.playerId, s.nightsWon])).toEqual([
      ['a', 1],
      ['b', 1],
    ]);
  });

  it('credits nobody on a break-even night', () => {
    const result = standings([night('n1', '2026-01-01', { a: 0, b: 0 })]);
    expect(result.unranked.map((s) => s.nightsWon)).toEqual([0, 0]);
  });
});
