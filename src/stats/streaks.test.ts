import type { PlayerSeason } from '@/stats/player-season';
import { playerSeason } from '@/stats/player-season';
import {
  bestStreak,
  currentUpStreak,
  hottestStreak,
  liveStreak,
  type Heater,
} from '@/stats/streaks';
import { describe, expect, it } from 'vitest';

const history = (nets: number[]) =>
  nets.map((netCents, index) => ({
    nightId: `n${index}`,
    date: `2026-01-${String(index + 1).padStart(2, '0')}`,
    netCents,
    won: false,
  }));

const season = (nets: Record<string, number>[]) => {
  const nights = nets.map((row, index) => ({
    id: `n${index}`,
    date: `2026-01-${String(index + 1).padStart(2, '0')}`,
    seats: Object.entries(row).map(([playerId, net]) => ({
      playerId,
      buyInCents: 10000,
      cashOutCents: 10000 + net,
    })),
  }));
  const ids = [...new Set(nets.flatMap((row) => Object.keys(row)))];
  return ids.map((id) => playerSeason(nights, id));
};

describe('currentUpStreak', () => {
  it.each([
    { name: 'no nights is no streak', nets: [], expected: 0 },
    { name: 'a losing last night ends the streak', nets: [100, 200, -50], expected: 0 },
    { name: 'counts the winning nights at the end', nets: [-100, 100, 200, 50], expected: 3 },
    { name: 'breaking even ends the streak', nets: [100, 0, 100], expected: 1 },
  ])('$name', ({ nets, expected }) => {
    expect(currentUpStreak(history(nets))).toBe(expected);
  });
});

describe('liveStreak', () => {
  it.each([
    {
      name: 'a single winning night is not a heater',
      nights: [{ a: 100, b: -100 }],
      expected: null,
    },
    {
      name: 'two up in a row is a heater',
      nights: [
        { a: 100, b: -100 },
        { a: 50, b: -50 },
      ],
      expected: { playerId: 'a', count: 2 },
    },
    {
      name: 'a tied streak goes to the bigger net',
      nights: [
        { a: 100, b: 300, c: -400 },
        { a: 100, b: 100, c: -200 },
      ],
      expected: { playerId: 'b', count: 2 },
    },
    {
      name: 'a streak that ended does not count',
      nights: [
        { a: 100, b: -100 },
        { a: 100, b: -100 },
        { a: -100, b: 100 },
      ],
      expected: null,
    },
  ])('$name', ({ nights, expected }) => {
    expect(liveStreak(season(nights))).toEqual(expected);
  });
});

describe('bestStreak', () => {
  it.each([
    { name: 'nobody up means no streak', nights: [{ a: 0, b: 0 }], expected: null },
    {
      name: 'finds the longest run even after it ended',
      nights: [
        { a: 100, b: -100 },
        { a: 100, b: -100 },
        { a: -100, b: 100 },
      ],
      expected: { playerId: 'a', count: 2 },
    },
  ])('$name', ({ nights, expected }) => {
    expect(bestStreak(season(nights))).toEqual(expected);
  });
});

describe('hottestStreak', () => {
  const ended = season([
    { a: 100, b: -100 },
    { a: 100, b: -100 },
    { a: 100, b: -100 },
    { a: -100, b: 100 },
  ]);
  const ongoing = season([
    { a: 100, b: -100 },
    { a: 100, b: -100 },
    { a: 100, b: -100 },
    { a: -100, b: 100 },
    { a: -100, b: 100 },
  ]);

  const rows: {
    name: string;
    players: PlayerSeason[];
    scope: 'ongoing' | 'finished';
    expected: Heater | null;
  }[] = [
    {
      name: 'an ongoing season prefers a live streak',
      players: ongoing,
      scope: 'ongoing',
      expected: { kind: 'live', playerId: 'b', count: 2 },
    },
    {
      name: 'an ongoing season without a live streak falls back to the best run',
      players: ended,
      scope: 'ongoing',
      expected: { kind: 'best', playerId: 'a', count: 3 },
    },
    {
      name: 'a finished season only reports the best run',
      players: ongoing,
      scope: 'finished',
      expected: { kind: 'best', playerId: 'a', count: 3 },
    },
    { name: 'no players means no streak', players: [], scope: 'ongoing', expected: null },
  ];

  it.each(rows)('$name', ({ players, scope, expected }) => {
    expect(hottestStreak(players, scope)).toEqual(expected);
  });
});
