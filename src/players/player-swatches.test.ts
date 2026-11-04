import { PLAYER_PALETTE_SLOTS } from '@/players/player-color';
import { PLAYER_SWATCHES, playerSwatch } from '@/players/player-swatches';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/theme/player-palette.css'), 'utf8');
const lightPalette = css.slice(0, css.indexOf('}'));

function cssColor(slot: number, kind: 'solid' | 'ink'): string | undefined {
  return new RegExp(`--player-${slot}-${kind}: (#[0-9a-f]+)`).exec(lightPalette)?.[1];
}

describe('playerSwatch', () => {
  it('has a swatch for every palette slot', () => {
    expect(PLAYER_SWATCHES).toHaveLength(PLAYER_PALETTE_SLOTS);
  });

  it('matches the light palette in the stylesheet', () => {
    PLAYER_SWATCHES.forEach((swatch, slot) => {
      expect(swatch).toEqual({ solid: cssColor(slot, 'solid'), ink: cssColor(slot, 'ink') });
    });
  });

  it.each([
    { name: 'a slot past the end wraps around', colorSlot: PLAYER_PALETTE_SLOTS + 1, slot: 1 },
    { name: 'a negative slot wraps from the end', colorSlot: -1, slot: PLAYER_PALETTE_SLOTS - 1 },
  ])('$name', ({ colorSlot, slot }) => {
    expect(playerSwatch(colorSlot)).toEqual(PLAYER_SWATCHES[slot]);
  });
});
