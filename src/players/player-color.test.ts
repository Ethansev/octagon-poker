import { PLAYER_PALETTE_SLOTS, playerColor, playerSlot } from '@/players/player-color';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

function fakeUuid(seed: number): string {
  const hex = createHash('sha256').update(String(seed)).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

describe('playerSlot', () => {
  it('gives the same slot for the same id every time', () => {
    const id = '7cc41425-9782-4deb-bc28-73fc7520963b';
    expect(playerSlot(id)).toBe(playerSlot(id));
    expect(playerSlot(id.toUpperCase())).toBe(playerSlot(id));
  });

  it('stays inside the palette', () => {
    for (let seed = 0; seed < 500; seed++) {
      const slot = playerSlot(fakeUuid(seed));
      expect(slot).toBeGreaterThanOrEqual(0);
      expect(slot).toBeLessThan(PLAYER_PALETTE_SLOTS);
      expect(Number.isInteger(slot)).toBe(true);
    }
  });

  it('spreads ids evenly across every slot', () => {
    const total = 3200;
    const counts = new Array<number>(PLAYER_PALETTE_SLOTS).fill(0);
    for (let seed = 0; seed < total; seed++) counts[playerSlot(fakeUuid(seed))]++;
    const expected = total / PLAYER_PALETTE_SLOTS;
    for (const count of counts) {
      expect(count).toBeGreaterThan(expected * 0.7);
      expect(count).toBeLessThan(expected * 1.3);
    }
  });
});

describe('playerColor', () => {
  it('keeps every existing color when a player joins', () => {
    const roster = Array.from({ length: 9 }, (_, seed) => fakeUuid(seed));
    const before = roster.map(playerColor);
    const after = [fakeUuid(99), ...roster].map(playerColor).slice(1);
    expect(after).toEqual(before);
  });

  it('points every part of the color at the same palette slot', () => {
    const color = playerColor('7cc41425-9782-4deb-bc28-73fc7520963b');
    expect(color).toEqual({
      slot: color.slot,
      solid: `var(--player-${color.slot}-solid)`,
      ink: `var(--player-${color.slot}-ink)`,
      soft: `var(--player-${color.slot}-soft)`,
      deep: `var(--player-${color.slot}-deep)`,
      glow: `var(--player-${color.slot}-glow)`,
    });
  });
});
