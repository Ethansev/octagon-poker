import { recapView, type RecapScope } from '@/app/(group)/recap/[year]/recap-view';
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

const identify = (playerId: string) => ({ name: playerId.toUpperCase(), colorSlot: 0 });

const streakNights = [
  night('n1', '2026-01-01', { a: -50, b: 50 }),
  night('n2', '2026-02-01', { a: 100, b: -100 }),
  night('n3', '2026-03-01', { a: 200, b: -200 }),
];

describe('recapView', () => {
  it('totals the year and ranks only the players who came out ahead', () => {
    const view = recapView(streakNights, identify, { kind: 'past', year: 2026 });
    expect(view).toMatchObject({ nightsPlayed: 3, potCents: 60000 });
    expect(view.players.map(({ playerId, name, rank }) => ({ playerId, name, rank }))).toEqual([
      { playerId: 'a', name: 'A', rank: 1 },
      { playerId: 'b', name: 'B', rank: null },
    ]);
    expect(view.awards.biggestNight).toMatchObject({ nightId: 'n3', netCents: 200 });
    expect(view.awards.biggestNight?.player.playerId).toBe('a');
  });

  it.each<{ name: string; scope: RecapScope; nights: typeof streakNights; live: boolean }>([
    {
      name: 'a streak still running this year is live',
      scope: { kind: 'current', year: 2026 },
      nights: streakNights,
      live: true,
    },
    {
      name: 'a streak in a finished year is history',
      scope: { kind: 'past', year: 2026 },
      nights: streakNights,
      live: false,
    },
    {
      name: 'a streak that already snapped is not live',
      scope: { kind: 'current', year: 2026 },
      nights: [...streakNights, night('n4', '2026-04-01', { a: -10, b: 10 })],
      live: false,
    },
  ])('$name', ({ scope, nights, live }) => {
    expect(recapView(nights, identify, scope).awards.longestUpStreak).toMatchObject({
      count: 2,
      live,
    });
  });

  it('gives no awards to a year nobody won', () => {
    const view = recapView([night('n1', '2026-01-01', { a: 0, b: 0 })], identify, {
      kind: 'current',
      year: 2026,
    });
    expect(view.awards).toEqual({
      mostNightsWon: null,
      biggestNight: null,
      longestUpStreak: null,
    });
  });
});
