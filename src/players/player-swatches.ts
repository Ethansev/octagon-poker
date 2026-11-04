import { PLAYER_PALETTE_SLOTS } from '@/players/player-color';

export type PlayerSwatch = { solid: string; ink: string };

export const PLAYER_SWATCHES: PlayerSwatch[] = [
  { solid: '#ce8a84', ink: '#321614' },
  { solid: '#81c6a4', ink: '#062619' },
  { solid: '#9480b8', ink: '#231a31' },
  { solid: '#bc9860', ink: '#2b1c03' },
  { solid: '#70c2d6', ink: '#01242b' },
  { solid: '#b57691', ink: '#2f1621' },
  { solid: '#8da971', ink: '#18230b' },
  { solid: '#9cb3eb', ink: '#161e35' },
  { solid: '#b87c60', ink: '#31180c' },
  { solid: '#5bb0a3', ink: '#002621' },
  { solid: '#cda3d6', ink: '#29182c' },
  { solid: '#9a8d4e', ink: '#251f03' },
  { solid: '#67a7cc', ink: '#052231' },
  { solid: '#e59ea5', ink: '#311619' },
  { solid: '#659b71', ink: '#0d2514' },
  { solid: '#9b96d1', ink: '#1e1b33' },
];

export function playerSwatch(colorSlot: number): PlayerSwatch {
  const slot = ((colorSlot % PLAYER_PALETTE_SLOTS) + PLAYER_PALETTE_SLOTS) % PLAYER_PALETTE_SLOTS;
  return PLAYER_SWATCHES[slot];
}
