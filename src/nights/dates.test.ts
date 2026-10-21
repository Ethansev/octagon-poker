import { describe, expect, it } from 'vitest';
import { formatNightDate, isRealDate } from '@/nights/dates';

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
