import { initials } from '@/players/initials';
import { describe, expect, it } from 'vitest';

describe('initials', () => {
  it.each([
    { name: 'a single name gives one letter', input: 'Ivy', expected: 'I' },
    { name: 'a first and last name give two letters', input: 'Marco Polo', expected: 'MP' },
    { name: 'middle names are skipped', input: 'Mary Jo Kim', expected: 'MK' },
    { name: 'lowercase names are capitalized', input: 'dev patel', expected: 'DP' },
    { name: 'extra spacing is ignored', input: '  Sid   Rao ', expected: 'SR' },
    { name: 'accented letters are kept whole', input: 'Émile Zola', expected: 'ÉZ' },
    { name: 'a leading emoji is not split in half', input: '🦈 Shark', expected: '🦈S' },
    { name: 'a hyphenated name counts as one word', input: 'Mary-Jo', expected: 'M' },
    { name: 'a blank name falls back to a question mark', input: '   ', expected: '?' },
  ])('$name', ({ input, expected }) => {
    expect(initials(input)).toBe(expected);
  });
});
