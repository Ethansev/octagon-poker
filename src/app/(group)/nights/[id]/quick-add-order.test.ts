import { quickAddOrder } from '@/app/(group)/nights/[id]/quick-add-order';
import type { Player } from '@/players/players';
import { describe, expect, it } from 'vitest';

const player = (name: string): Player => ({
  id: name.toLowerCase(),
  groupId: 'group',
  name,
  colorSlot: 0,
});

const everyone = ['Ava', 'Ben', 'Cal', 'Dev'].map(player);

describe('quickAddOrder', () => {
  it.each([
    {
      name: 'nobody has played, so it is alphabetical',
      recent: [],
      expected: ['Ava', 'Ben', 'Cal', 'Dev'],
    },
    {
      name: 'recent players come first, and everyone else stays alphabetical',
      recent: ['dev', 'ben'],
      expected: ['Dev', 'Ben', 'Ava', 'Cal'],
    },
    {
      name: 'a recent player already at the table does not disturb the rest',
      recent: ['zed', 'cal'],
      expected: ['Cal', 'Ava', 'Ben', 'Dev'],
    },
  ])('$name', ({ recent, expected }) => {
    expect(quickAddOrder(everyone, recent).map((p) => p.name)).toEqual(expected);
  });
});
