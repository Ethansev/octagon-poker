export const PLAYER_PALETTE_SLOTS = 16;

export type PlayerColor = {
  slot: number;
  solid: string;
  ink: string;
  soft: string;
  deep: string;
  glow: string;
};

export function leastUsedSlot(usedSlots: number[]): number {
  const counts = new Array<number>(PLAYER_PALETTE_SLOTS).fill(0);
  for (const slot of usedSlots) {
    if (slot >= 0 && slot < PLAYER_PALETTE_SLOTS) counts[slot]++;
  }
  return counts.indexOf(Math.min(...counts));
}

export function playerColor(colorSlot: number): PlayerColor {
  const slot = ((colorSlot % PLAYER_PALETTE_SLOTS) + PLAYER_PALETTE_SLOTS) % PLAYER_PALETTE_SLOTS;
  return {
    slot,
    solid: `var(--player-${slot}-solid)`,
    ink: `var(--player-${slot}-ink)`,
    soft: `var(--player-${slot}-soft)`,
    deep: `var(--player-${slot}-deep)`,
    glow: `var(--player-${slot}-glow)`,
  };
}
