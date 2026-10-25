export const PLAYER_PALETTE_SLOTS = 16;

export type PlayerColor = {
  slot: number;
  solid: string;
  ink: string;
  soft: string;
  deep: string;
  glow: string;
};

export function playerSlot(playerId: string): number {
  let hash = 0x811c9dc5;
  for (const char of playerId.toLowerCase()) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % PLAYER_PALETTE_SLOTS;
}

export function playerColor(playerId: string): PlayerColor {
  const slot = playerSlot(playerId);
  return {
    slot,
    solid: `var(--player-${slot}-solid)`,
    ink: `var(--player-${slot}-ink)`,
    soft: `var(--player-${slot}-soft)`,
    deep: `var(--player-${slot}-deep)`,
    glow: `var(--player-${slot}-glow)`,
  };
}
