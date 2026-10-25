import { leastUsedSlot, PLAYER_PALETTE_SLOTS, playerColor } from '@/players/player-color';
import { describe, expect, it } from 'vitest';

const fill = (count: number) => Array.from({ length: count }, (_, slot) => slot);

describe('leastUsedSlot', () => {
  it.each([
    { name: 'an empty group starts at the first slot', used: [], expected: 0 },
    { name: 'the next player takes the next unused slot', used: [0, 1, 2], expected: 3 },
    { name: 'a gap left by a merge is filled first', used: [0, 1, 3, 4], expected: 2 },
    { name: 'a full palette wraps back to the first slot', used: fill(16), expected: 0 },
    {
      name: 'after one wrap the least-used slot wins',
      used: [...fill(16), 0, 1],
      expected: 2,
    },
    {
      name: 'ties between equally used slots go to the lowest slot',
      used: [5, 5, 0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0, 1],
      expected: 2,
    },
    { name: 'out-of-range slots are ignored', used: [-1, 16, 0], expected: 1 },
  ])('$name', ({ used, expected }) => {
    expect(leastUsedSlot(used)).toBe(expected);
  });
});

describe('playerColor', () => {
  it.each([
    { name: 'a slot maps to its own palette variables', slot: 7, expected: 7 },
    { name: 'a slot past the palette wraps', slot: PLAYER_PALETTE_SLOTS + 2, expected: 2 },
  ])('$name', ({ slot, expected }) => {
    expect(playerColor(slot)).toEqual({
      slot: expected,
      solid: `var(--player-${expected}-solid)`,
      ink: `var(--player-${expected}-ink)`,
      soft: `var(--player-${expected}-soft)`,
      deep: `var(--player-${expected}-deep)`,
      glow: `var(--player-${expected}-glow)`,
    });
  });
});
