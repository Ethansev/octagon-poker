import {
  ordinal,
  winLabel,
  winnerHeadline,
  winnerKicker,
} from '@/app/(group)/nights/[id]/winner-copy';
import { describe, expect, it } from 'vitest';

describe('ordinal', () => {
  it.each([
    { name: 'first', n: 1, expected: '1st' },
    { name: 'second', n: 2, expected: '2nd' },
    { name: 'third', n: 3, expected: '3rd' },
    { name: 'fourth', n: 4, expected: '4th' },
    { name: 'the teens all take th', n: 12, expected: '12th' },
    { name: 'twenty-first', n: 21, expected: '21st' },
    { name: 'one hundred thirteenth', n: 113, expected: '113th' },
  ])('$name', ({ n, expected }) => {
    expect(ordinal(n)).toBe(expected);
  });
});

describe('winner copy', () => {
  it.each([
    {
      name: 'a single winner takes it',
      names: ['Ivy Chen'],
      kicker: 'Winner winner',
      headline: 'Ivy Chen takes it!',
    },
    {
      name: 'two winners split it by first name',
      names: ['Ivy Chen', 'Sid Rao'],
      kicker: 'Split at the top',
      headline: 'Ivy and Sid split it!',
    },
    {
      name: 'nobody up means everyone broke even',
      names: [],
      kicker: 'No winner tonight',
      headline: 'Everybody broke even',
    },
  ])('$name', ({ names, kicker, headline }) => {
    expect(winnerKicker(names.length)).toBe(kicker);
    expect(winnerHeadline(names)).toBe(headline);
  });

  it.each([
    { name: 'a solo win reads plainly', shared: false, expected: '3rd win of 2026' },
    { name: 'a shared win names the player', shared: true, expected: 'Ivy’s 3rd win of 2026' },
  ])('$name', ({ shared, expected }) => {
    expect(winLabel('Ivy Chen', 3, 2026, shared)).toBe(expected);
  });
});
