import { firstName } from '@/players/first-name';
import { initials } from '@/players/initials';
import { playerSwatch } from '@/players/player-swatches';
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const fontPath = (file: string) => join(process.cwd(), 'src/link-previews/fonts', file);
const semiBold = readFile(fontPath('Manrope-SemiBold.ttf'));
const extraBold = readFile(fontPath('Manrope-ExtraBold.ttf'));

export const previewSize = { width: 1200, height: 630 };

export const previewColors = {
  hero: '#1c1917',
  ink: '#faf8f5',
  muted: 'rgba(250, 248, 245, 0.62)',
  figure: '#6ee7b7',
  chip: 'rgba(250, 248, 245, 0.08)',
};

export async function renderPreview(card: React.ReactElement) {
  return new ImageResponse(card, {
    ...previewSize,
    fonts: [
      { name: 'Manrope', data: await semiBold, weight: 600, style: 'normal' },
      { name: 'Manrope', data: await extraBold, weight: 800, style: 'normal' },
    ],
  });
}

export function PreviewMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: previewColors.ink,
        color: previewColors.hero,
        fontSize: size * 0.6,
        fontWeight: 800,
        clipPath: 'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)',
      }}>
      8
    </div>
  );
}

export function PreviewAvatar({ name, colorSlot }: { name: string; colorSlot: number }) {
  const swatch = playerSwatch(colorSlot);
  return (
    <div
      style={{
        width: 52,
        height: 52,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        background: swatch.solid,
        color: swatch.ink,
        fontSize: 22,
        fontWeight: 800,
      }}>
      {initials(firstName(name))}
    </div>
  );
}

export function PreviewKicker({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: 4,
        color: previewColors.muted,
      }}>
      {children.toUpperCase()}
    </div>
  );
}

export function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 64px',
        background: previewColors.hero,
        color: previewColors.ink,
        fontFamily: 'Manrope',
      }}>
      {children}
    </div>
  );
}
