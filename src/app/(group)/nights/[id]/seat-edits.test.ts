import { currentEdit, editFrom, isDirty } from '@/app/(group)/nights/[id]/seat-edits';
import { describe, expect, it } from 'vitest';

const seat = {
  playerId: 'ivy',
  playerName: 'Ivy',
  colorSlot: 1,
  buyInCents: 2000,
  cashOutCents: null,
  updatedAt: '2026-10-21T02:00:00.000Z',
};

const serverEdit = editFrom({ buyIn: '20', cashOut: '', updatedAt: seat.updatedAt });

describe('isDirty', () => {
  it.each([
    { name: 'untouched numbers are clean', edit: serverEdit, expected: false },
    { name: 'a typed cash-out is dirty', edit: { ...serverEdit, cashOut: '35' }, expected: true },
    {
      name: 'a seat that was never saved is always dirty',
      edit: editFrom({ buyIn: '20', cashOut: '', updatedAt: null }),
      expected: true,
    },
  ])('$name', ({ edit, expected }) => {
    expect(isDirty(edit)).toBe(expected);
  });
});

describe('currentEdit', () => {
  it.each([
    { name: 'no stored edit reads the server seat', stored: undefined, expected: serverEdit },
    {
      name: 'typed text survives switching seats',
      stored: { ...serverEdit, cashOut: '35' },
      expected: { ...serverEdit, cashOut: '35' },
    },
    {
      name: 'a server error stays visible',
      stored: { ...serverEdit, invalidField: 'buyIn' as const },
      expected: { ...serverEdit, invalidField: 'buyIn' as const },
    },
    {
      name: 'a just-saved seat holds its numbers until the page catches up',
      stored: editFrom({ buyIn: '20', cashOut: '35', updatedAt: '2026-10-21T03:00:00.000Z' }),
      expected: editFrom({ buyIn: '20', cashOut: '35', updatedAt: '2026-10-21T03:00:00.000Z' }),
    },
    {
      name: 'a clean edit gives way once the server seat is as new',
      stored: editFrom({ buyIn: '40', cashOut: '', updatedAt: seat.updatedAt }),
      expected: serverEdit,
    },
  ])('$name', ({ stored, expected }) => {
    expect(currentEdit(seat, stored)).toEqual(expected);
  });
});
