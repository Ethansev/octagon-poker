import { LiveDot } from '@/app/(group)/_home/live-dot';
import type { RecentNight } from '@/app/(group)/_home/load-home';
import { cn } from '@/lib/utils';
import { nightDateParts } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SHOWN = 8;

function NightRow({ night }: { night: RecentNight }) {
  const { month, day, weekday } = nightDateParts(night.date);
  const open = night.status === 'open';
  return (
    <li>
      <Link
        href={`/nights/${night.id}`}
        className='group flex cursor-pointer items-center gap-3 rounded-3xl p-2 transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
        <span
          className={cn(
            'grid size-14 shrink-0 place-items-center rounded-2xl text-center leading-none',
            open ? 'bg-live text-live-ink' : 'bg-surface-3 text-ink',
          )}>
          <span>
            <span className='block text-[10px] font-extrabold tracking-wider uppercase opacity-80'>
              {month}
            </span>
            <span className='block text-2xl font-bold tabular-nums'>{day}</span>
          </span>
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block truncate font-extrabold'>{night.location ?? weekday}</span>
          <span className='block truncate text-sm font-semibold text-ink-2'>
            {open ? (
              <span className='inline-flex items-center gap-1.5 font-extrabold text-live'>
                <LiveDot />
                Live now
              </span>
            ) : night.winners.length > 0 ? (
              <>
                <span aria-hidden>🏆 </span>
                {joinNames(night.winners.map((winner) => firstName(winner.name)))}
              </>
            ) : (
              'No winner'
            )}
          </span>
        </span>
        <span aria-hidden className='flex -space-x-2'>
          {night.winners.slice(0, 2).map((winner) => (
            <span key={winner.playerId} className='rounded-full ring-2 ring-surface'>
              <PlayerAvatar playerId={winner.playerId} name={winner.name} size={30} />
            </span>
          ))}
        </span>
        <ChevronRight
          aria-hidden
          className='size-5 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink-2 motion-reduce:transition-none'
        />
      </Link>
    </li>
  );
}

const listClass = 'grid gap-1 md:grid-cols-2 md:gap-x-4';

export function RecentNightsCard({ nights }: { nights: RecentNight[] }) {
  const shown = nights.slice(0, SHOWN);
  const rest = nights.slice(SHOWN);
  return (
    <section
      aria-labelledby='recent-heading'
      className='h-full rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='recent-heading' className='text-3xl font-bold tracking-tight'>
        Recent nights
      </h2>
      <ul className={cn('mt-4', listClass)}>
        {shown.map((night) => (
          <NightRow key={night.id} night={night} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className='group/more mt-1'>
          <summary className='mx-2 mt-2 inline-flex h-10 list-none items-center gap-1.5 rounded-full px-4 text-sm font-extrabold text-ink-2 transition select-none group-open/more:hidden hover:bg-surface-2 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none [&::-webkit-details-marker]:hidden'>
            Show {rest.length} older {rest.length === 1 ? 'night' : 'nights'}
            <ChevronDown aria-hidden className='size-4' />
          </summary>
          <ul className={listClass}>
            {rest.map((night) => (
              <NightRow key={night.id} night={night} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
