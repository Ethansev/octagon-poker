import { describe, expect, it } from 'vitest';
import { formatDollars, formatNet, parseDollars } from '@/money/money';

describe('parseDollars', () => {
  it.each([
    { name: 'blank means not entered', input: '', expected: { kind: 'empty' } },
    { name: 'whitespace means not entered', input: '  ', expected: { kind: 'empty' } },
    { name: 'whole dollars', input: '20', expected: { kind: 'amount', cents: 2000 } },
    { name: 'padded whole dollars', input: ' 20 ', expected: { kind: 'amount', cents: 2000 } },
    { name: 'trailing dot', input: '20.', expected: { kind: 'amount', cents: 2000 } },
    { name: 'one decimal place', input: '20.5', expected: { kind: 'amount', cents: 2050 } },
    { name: 'dollar sign and thousands commas', input: '$1,200.50', expected: { kind: 'amount', cents: 120050 } },
    { name: 'negative is rejected', input: '-5', expected: { kind: 'invalid' } },
    { name: 'exponent is rejected', input: '1e3', expected: { kind: 'invalid' } },
    { name: 'three decimals are rejected', input: '20.555', expected: { kind: 'invalid' } },
    { name: 'letters are rejected', input: 'abc', expected: { kind: 'invalid' } },
    { name: 'the maximum amount is accepted', input: '100000', expected: { kind: 'amount', cents: 10000000 } },
    { name: 'one cent over the maximum is rejected', input: '100000.01', expected: { kind: 'invalid' } },
    { name: 'misplaced comma is rejected', input: '1,20', expected: { kind: 'invalid' } },
  ])('$name', ({ input, expected }) => {
    expect(parseDollars(input)).toEqual(expected);
  });
});

describe('formatDollars', () => {
  it.each([
    { name: 'whole dollars have no cents', cents: 2000, expected: '$20' },
    { name: 'fractional dollars show two decimals', cents: 2050, expected: '$20.50' },
    { name: 'thousands are grouped', cents: 120000, expected: '$1,200' },
  ])('$name', ({ cents, expected }) => {
    expect(formatDollars(cents)).toBe(expected);
  });
});

describe('formatNet', () => {
  it.each([
    { name: 'positive net gets a plus', cents: 11800, expected: '+$118' },
    { name: 'negative net uses the minus sign', cents: -5500, expected: '−$55' },
    { name: 'zero has no sign', cents: 0, expected: '$0' },
  ])('$name', ({ cents, expected }) => {
    expect(formatNet(cents)).toBe(expected);
  });
});
