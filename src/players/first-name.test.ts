import { firstName } from '@/players/first-name';
import { describe, expect, it } from 'vitest';

describe('firstName', () => {
  it.each([
    { name: 'a single name is kept', input: 'Ivy', expected: 'Ivy' },
    { name: 'a surname is dropped', input: 'Marco Polo', expected: 'Marco' },
    { name: 'surrounding spaces are ignored', input: '  Sid  Rao ', expected: 'Sid' },
    { name: 'a hyphenated name stays whole', input: 'Mary-Jo Kim', expected: 'Mary-Jo' },
    { name: 'a blank name is returned as-is', input: '   ', expected: '   ' },
  ])('$name', ({ input, expected }) => {
    expect(firstName(input)).toBe(expected);
  });
});
