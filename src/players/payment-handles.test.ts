import { parsePaymentHandles, venmoProfileUrl } from '@/players/payment-handles';
import { describe, expect, it } from 'vitest';

describe('parsePaymentHandles', () => {
  it.each([
    {
      name: 'both left blank clears them',
      input: { venmo: '  ', zelle: '' },
      expected: { kind: 'ok', handles: { venmoHandle: null, zelleHandle: null } },
    },
    {
      name: 'a Venmo typed with its at sign keeps only the username',
      input: { venmo: ' @Sid-Rao_1 ', zelle: '' },
      expected: { kind: 'ok', handles: { venmoHandle: 'Sid-Rao_1', zelleHandle: null } },
    },
    {
      name: 'a Zelle phone number keeps its formatting',
      input: { venmo: '', zelle: ' (415) 555-0100 ' },
      expected: { kind: 'ok', handles: { venmoHandle: null, zelleHandle: '(415) 555-0100' } },
    },
    {
      name: 'a pasted Venmo link is refused',
      input: { venmo: 'https://venmo.com/u/sid', zelle: '' },
      expected: { kind: 'invalid', field: 'venmo' },
    },
    {
      name: 'a Venmo username that is too long is refused',
      input: { venmo: 'a'.repeat(31), zelle: '' },
      expected: { kind: 'invalid', field: 'venmo' },
    },
    {
      name: 'a Zelle that is too long is refused',
      input: { venmo: '', zelle: 'a'.repeat(81) },
      expected: { kind: 'invalid', field: 'zelle' },
    },
  ])('$name', ({ input, expected }) => {
    expect(parsePaymentHandles(input)).toEqual(expected);
  });
});

describe('venmoProfileUrl', () => {
  it('points at the public profile', () => {
    expect(venmoProfileUrl('Sid-Rao_1')).toBe('https://venmo.com/u/Sid-Rao_1');
  });
});
