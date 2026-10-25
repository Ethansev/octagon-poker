import type { LastNight } from '@/app/(group)/_home/load-home';
import {
  StoryKicker,
  StorySegments,
  storyCardClass,
  storyLinkClass,
} from '@/app/(group)/_home/story-card';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

const SHOWN_SEATS = 6;

function headline(night: LastNight): string {
  const [lead, ...rest] = night.winners;
  if (!lead) return 'Nobody came out ahead';
  if (rest.length === 0) return `${firstName(lead.name)} took the night`;
  return `${joinNames(night.winners.map((winner) => firstName(winner.name)))} split the top`;
}

export function LastNightStory({ night }: { night: LastNight }) {
  const [lead, ...coWinners] = night.winners;
  const shown = night.seats.slice(0, SHOWN_SEATS);
  const extra = night.seats.length - shown.length;

  return (
    <Link
      href={`/nights/${night.id}`}
      className={cn(
        storyCardClass,
        storyLinkClass,
        'group min-h-[460px] bg-hero text-hero-ink shadow-hero lg:col-span-6 lg:row-span-2 lg:min-h-0',
      )}>
      <StorySegments index={0} tone='hero' />
      <StoryKicker>Last night · {formatNightDate(night.date)}</StoryKicker>
      {night.location && (
        <p className='mt-1 inline-flex items-center gap-1 text-sm font-bold text-current/85'>
          <MapPin aria-hidden className='size-3.5' />
          {night.location}
        </p>
      )}

      {lead && (
        <div className='mt-8 flex items-end sm:mt-10'>
          <span className='relative'>
            <span
              aria-hidden
              className='absolute -top-7 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-4xl'>
              👑
            </span>
            <span className='block rounded-full bg-frame p-1.5'>
              <PlayerAvatar playerId={lead.playerId} name={lead.name} size={96} />
            </span>
          </span>
          {coWinners.slice(0, 2).map((winner) => (
            <span key={winner.playerId} className='-ml-6 block rounded-full bg-frame p-1'>
              <PlayerAvatar playerId={winner.playerId} name={winner.name} size={72} />
            </span>
          ))}
        </div>
      )}

      <h2 className='mt-5 text-[34px] leading-[0.95] font-bold tracking-tight text-balance sm:text-5xl'>
        {headline(night)}
        {lead && <span aria-hidden> 🏆</span>}
      </h2>
      {lead && (
        <p className='mt-2 text-6xl leading-none font-bold tracking-tight text-hero-figure tabular-nums sm:text-8xl lg:text-[128px]'>
          {formatNet(lead.netCents)}
        </p>
      )}

      <div className='mt-auto pt-6 sm:pt-8'>
        <ul aria-label='Seats' className='flex flex-wrap gap-2'>
          {shown.map((seat) => {
            const up = seat.netCents > 0;
            return (
              <li
                key={seat.playerId}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-sm font-extrabold tabular-nums',
                  up ? 'bg-hero-chip text-hero-chip-ink' : 'bg-hero-chip-muted text-hero-muted',
                )}>
                <PlayerAvatar
                  playerId={seat.playerId}
                  name={seat.name}
                  size={24}
                  tone={up ? 'solid' : 'muted'}
                />
                {firstName(seat.name)}
                <span className={up ? 'text-hero-chip-win' : 'font-bold'}>
                  {formatNet(seat.netCents)}
                </span>
              </li>
            );
          })}
          {extra > 0 && (
            <li className='inline-flex items-center rounded-full bg-hero-chip-muted px-3 py-1 text-sm font-extrabold text-hero-muted'>
              +{extra} more
            </li>
          )}
        </ul>
        <div className='mt-5 flex items-center justify-between gap-3 border-t border-current/20 pt-4'>
          <p className='text-sm leading-tight font-bold text-current/85'>
            <span className='tabular-nums'>{formatDollars(night.potCents)}</span> pot
            <span className='block sm:inline'>
              <span className='hidden sm:inline'> · </span>
              {night.seats.length} {night.seats.length === 1 ? 'player' : 'players'}
            </span>
          </p>
          <span className='inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-extrabold whitespace-nowrap text-primary-ink transition group-hover:gap-2 group-hover:bg-primary-hover motion-reduce:transition-none'>
            See the night <ArrowRight aria-hidden className='size-4' />
          </span>
        </div>
      </div>
    </Link>
  );
}
