import { formatNightDate, formatShortNightDate, isRealDate, nightDateParts } from '@/nights/dates';
import { describe, expect, it } from 'vitest';

describe('isRealDate', () => {
  it.each([
    { name: 'a normal date is real', value: '2026-10-17', real: true },
    { name: 'Feb 31 does not exist', value: '2026-02-31', real: false },
    { name: 'leap day in a leap year is real', value: '2028-02-29', real: true },
    { name: 'free text is rejected', value: 'yesterday', real: false },
  ])('$name', ({ value, real }) => {
    expect(isRealDate(value)).toBe(real);
  });
});

describe('date formatting', () => {
  it('formats a night date without timezone drift', () => {
    expect(formatNightDate('2026-10-17')).toBe('Sat, Oct 17, 2026');
  });
});

describe('nightDateParts', () => {
  it.each([
    {
      name: 'splits a night into its calendar tile parts',
      value: '2026-10-17',
      expected: { month: 'Oct', day: 17, weekday: 'Saturday' },
    },
    {
      name: 'the first of the year stays in January',
      value: '2026-01-01',
      expected: { month: 'Jan', day: 1, weekday: 'Thursday' },
    },
  ])('$name', ({ value, expected }) => {
    expect(nightDateParts(value)).toEqual(expected);
  });
});

describe('formatShortNightDate', () => {
  it('drops the year', () => {
    expect(formatShortNightDate('2026-03-07')).toBe('Sat, Mar 7');
  });
});
