import { rebuyCount, seatNetCents, stepAmount } from '@/app/(group)/nights/[id]/seat-data';
import { describe, expect, it } from 'vitest';

describe('stepAmount', () => {
  it.each([
    { name: 'a rebuy adds the step', text: '20', delta: 2000, floor: 0, expected: '40' },
    { name: 'an empty field steps up from zero', text: '', delta: 500, floor: 0, expected: '5' },
    { name: 'stepping down stops at the floor', text: '3', delta: -500, floor: 0, expected: '0' },
    {
      name: 'removing a rebuy never goes below one buy-in',
      text: '30',
      delta: -2000,
      floor: 2000,
      expected: '20',
    },
    { name: 'cents survive a step', text: '12.50', delta: 500, floor: 0, expected: '17.50' },
    { name: 'a typo is left alone', text: '12x', delta: 500, floor: 0, expected: '12x' },
  ])('$name', ({ text, delta, floor, expected }) => {
    expect(stepAmount(text, delta, floor)).toBe(expected);
  });
});

describe('rebuyCount', () => {
  it.each([
    { name: 'one buy-in is no rebuys', buyIn: 2000, step: 2000, expected: 0 },
    { name: 'three buy-ins is two rebuys', buyIn: 6000, step: 2000, expected: 2 },
    { name: 'an odd amount has no count', buyIn: 2500, step: 2000, expected: null },
    { name: 'a night without a buy-in has no count', buyIn: 2000, step: null, expected: null },
    { name: 'a seat without a buy-in has no count', buyIn: null, step: 2000, expected: null },
  ])('$name', ({ buyIn, step, expected }) => {
    expect(rebuyCount(buyIn, step)).toBe(expected);
  });
});

describe('seatNetCents', () => {
  it.each([
    { name: 'still playing has no net', buyInCents: 2000, cashOutCents: null, expected: null },
    {
      name: 'a cash-out above the buy-in is up',
      buyInCents: 2000,
      cashOutCents: 3500,
      expected: 1500,
    },
    { name: 'busting loses the buy-in', buyInCents: 2000, cashOutCents: 0, expected: -2000 },
  ])('$name', ({ buyInCents, cashOutCents, expected }) => {
    expect(seatNetCents({ buyInCents, cashOutCents })).toBe(expected);
  });
});
