import type { SeasonPlayer } from '@/app/(group)/season-players';
import { StoryKicker, StorySegments, storyLinkClass } from '@/app/(group)/story-card';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from '@/players/player-avatar';
import Link from 'next/link';

export type Award = {
  key: string;
  kicker: string;
  players: SeasonPlayer[];
  mark: React.ReactNode;
  headline: string;
  figure: string;
  footnote: string;
  surface: string;
  figureClass: string;
};

const SHOWN_AVATARS = 3;

function Avatars({ players }: { players: SeasonPlayer[] }) {
  const shown = players.slice(0, SHOWN_AVATARS);
  const extra = players.length - shown.length;
  return (
    <span className='flex items-center'>
      {shown.map((player, index) => (
        <span
          key={player.playerId}
          className={cn('rounded-full bg-frame p-1', index > 0 && '-ml-5')}>
          <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={72} />
        </span>
      ))}
      {extra > 0 && (
        <span className='-ml-5 grid size-20 place-items-center rounded-full bg-frame text-lg font-extrabold'>
          +{extra}
        </span>
      )}
    </span>
  );
}

export function AwardCard({
  award,
  index,
  count,
  year,
}: {
  award: Award;
  index: number;
  count: number;
  year: number;
}) {
  const single = award.players.length === 1 ? award.players[0] : null;
  const body = (
    <>
      <StorySegments index={index} count={count} tone='story' />
      <StoryKicker>{award.kicker}</StoryKicker>
      <div className='mt-6 flex min-h-20 items-center gap-3'>
        <Avatars players={award.players} />
        {award.mark}
      </div>
      <p className='mt-6 text-3xl leading-tight font-semibold tracking-tight text-balance'>
        {award.headline}
      </p>
      <p
        className={cn(
          'mt-auto pt-6 text-6xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-7xl',
          award.figureClass,
        )}>
        {award.figure}
      </p>
      <p className='mt-2 text-sm font-bold text-current/70'>{award.footnote}</p>
    </>
  );
  const className = cn(
    'relative flex min-h-[380px] flex-col overflow-hidden rounded-panel p-6 sm:p-8',
    award.surface,
  );
  if (!single) return <div className={className}>{body}</div>;
  return (
    <Link
      href={`/players/${single.playerId}?season=${year}`}
      className={cn(className, storyLinkClass, 'hover:shadow-lift')}>
      {body}
    </Link>
  );
}
