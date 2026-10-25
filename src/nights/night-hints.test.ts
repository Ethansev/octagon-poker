import { nightHints, QUICK_BUY_INS } from '@/nights/night-hints';
import type { NightSummary } from '@/nights/nights';
import { describe, expect, it } from 'vitest';

function night(overrides: Partial<NightSummary> & { id: string }): NightSummary {
  return {
    date: '2026-10-17',
    location: null,
    buyInCents: null,
    status: 'closed',
    winnerNames: [],
    ...overrides,
  };
}

describe('nightHints', () => {
  it('has nothing to suggest before the first night', () => {
    expect(nightHints([])).toEqual({
      open: null,
      last: null,
      picks: { locations: [], buyIns: QUICK_BUY_INS },
    });
  });

  it('splits the open night from the last finished one', () => {
    const open = night({ id: 'open', date: '2026-10-21', status: 'open' });
    const closed = night({ id: 'closed', date: '2026-10-17' });
    const older = night({ id: 'older', date: '2026-09-12' });

    const hints = nightHints([open, closed, older]);

    expect(hints.open?.id).toBe('open');
    expect(hints.last?.id).toBe('closed');
  });

  it.each([
    {
      name: 'the most played spot comes first, ties go to the most recent',
      locations: ["Ivy's", "Sid's", "Ivy's", "Marco's", "Sid's", "Sid's"],
      expected: ["Sid's", "Ivy's", "Marco's"],
    },
    {
      name: 'the same spot typed in a different case is one pick, spelled the newest way',
      locations: ["sid's", "Sid's", null, '  '],
      expected: ["sid's"],
    },
    {
      name: 'only the five most played spots make the list',
      locations: ['A', 'B', 'C', 'D', 'E', 'F', 'A'],
      expected: ['A', 'B', 'C', 'D', 'E'],
    },
  ])('$name', ({ locations, expected }) => {
    const nights = locations.map((location, index) => night({ id: String(index), location }));
    expect(nightHints(nights).picks.locations).toEqual(expected);
  });

  it.each([
    {
      name: 'standard amounts already used add nothing',
      used: [20000, 20000, 5000],
      expected: QUICK_BUY_INS,
    },
    {
      name: 'a house amount joins the standard ones in order',
      used: [4000, 4000, null],
      expected: [2000, 4000, 5000, 10000, 20000],
    },
    {
      name: 'only the two most used house amounts join',
      used: [4000, 30000, 30000, 2500],
      expected: [2000, 4000, 5000, 10000, 20000, 30000],
    },
  ])('$name', ({ used, expected }) => {
    const nights = used.map((buyInCents, index) => night({ id: String(index), buyInCents }));
    expect(nightHints(nights).picks.buyIns).toEqual(expected);
  });
});
