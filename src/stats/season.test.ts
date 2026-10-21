import { nightsInSeason, parseSeason, type Season } from '@/stats/season';
import { describe, expect, it } from 'vitest';

const night = (date: string) => ({ id: date, date, seats: [] });
const nights = [night('2025-12-31'), night('2026-01-01'), night('2026-07-04')];

describe('nightsInSeason', () => {
  const rows: { name: string; season: Season; ids: string[] }[] = [
    {
      name: 'the last night of the prior year is excluded',
      season: 2026,
      ids: ['2026-01-01', '2026-07-04'],
    },
    { name: 'a past year only includes its own nights', season: 2025, ids: ['2025-12-31'] },
    {
      name: 'the lifetime view returns everything',
      season: 'all',
      ids: ['2025-12-31', '2026-01-01', '2026-07-04'],
    },
  ];
  it.each(rows)('$name', ({ season, ids }) => {
    expect(nightsInSeason(nights, season).map((n) => n.id)).toEqual(ids);
  });
});

describe('parseSeason', () => {
  it.each([
    { name: 'missing falls back to the current year', value: undefined, expected: 2026 },
    { name: 'a four-digit year is used', value: '2025', expected: 2025 },
    { name: 'all selects the lifetime view', value: 'all', expected: 'all' },
    { name: 'text falls back to the current year', value: 'abc', expected: 2026 },
    { name: 'a five-digit number falls back to the current year', value: '20255', expected: 2026 },
  ])('$name', ({ value, expected }) => {
    expect(parseSeason(value, 2026)).toBe(expected);
  });
});
