import { cn } from '@/lib/utils';
import { initials } from '@/players/initials';
import { playerColor } from '@/players/player-color';

type PlayerAvatarProps = {
  playerId: string;
  name: string;
  size?: number;
  tone?: 'solid' | 'muted';
  ring?: number;
  className?: string;
};

export function PlayerAvatar({
  playerId,
  name,
  size = 40,
  tone = 'solid',
  ring = 0,
  className,
}: PlayerAvatarProps) {
  const color = playerColor(playerId);
  const letters = initials(name);
  const muted = tone === 'muted';

  return (
    <span
      aria-hidden
      data-slot='player-avatar'
      className={cn(
        'relative inline-grid shrink-0 place-items-center rounded-full leading-none font-semibold select-none',
        muted && 'opacity-80 saturate-[0.35]',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * (letters.length > 1 ? 0.38 : 0.46)),
        background: muted ? color.soft : color.solid,
        color: muted ? color.deep : color.ink,
        boxShadow:
          ring > 0
            ? `0 0 0 ${ring}px var(--ring-gap), 0 0 0 ${ring * 2}px ${muted ? 'var(--ring-muted)' : color.glow}`
            : undefined,
      }}>
      {letters}
    </span>
  );
}
