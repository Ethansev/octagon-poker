import type { PlayerProfile, ProfileNight } from '@/app/(group)/players/[id]/load-player';
import { seasonSpan } from '@/app/(group)/season-copy';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { formatNightDate, nightDateParts } from '@/nights/dates';
import { playerColor, type PlayerColor } from '@/players/player-color';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

function NightRow({ night, color }: { night: ProfileNight; color: PlayerColor }) {
  const { month, day, weekday } = nightDateParts(night.date);
  const up = night.netCents > 0;
  return (
    <li>
      <Link
        href={`/nights/${night.nightId}`}
        className='group flex cursor-pointer items-center gap-3 rounded-3xl p-2 transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
        <span
          className={cn(
            'grid size-14 shrink-0 place-items-center rounded-2xl text-center leading-none',
            !night.won && 'bg-surface-3 text-ink',
          )}
          style={night.won ? { background: color.solid, color: color.ink } : undefined}>
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
            {night.won ? (
              <>
                <span aria-hidden>🏆 </span>Took the night
              </>
            ) : (
              formatNightDate(night.date)
            )}
          </span>
        </span>
        <span
          className={cn(
            'text-xl font-bold tracking-tight whitespace-nowrap tabular-nums',
            up ? 'text-win' : 'text-loss',
          )}>
          {formatNet(night.netCents)}
        </span>
        <ChevronRight
          aria-hidden
          className='size-5 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink-2 motion-reduce:transition-none'
        />
      </Link>
    </li>
  );
}

export function ProfileHistory({ profile }: { profile: PlayerProfile }) {
  const color = playerColor(profile.player.colorSlot);
  const newestFirst = [...profile.nights].reverse();
  const count = newestFirst.length;

  return (
    <section
      aria-labelledby='history-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='history-heading' className='text-3xl font-bold tracking-tight'>
        Night by night
      </h2>
      <p className='mt-1 text-sm font-semibold text-ink-2'>
        {count === 1
          ? `One night ${seasonSpan(profile.scope)}.`
          : `${count} nights ${seasonSpan(profile.scope)}, newest first.`}
      </p>
      <ul className='mt-4 grid gap-1 md:grid-cols-2 md:gap-x-4'>
        {newestFirst.map((night) => (
          <NightRow key={night.nightId} night={night} color={color} />
        ))}
      </ul>
    </section>
  );
}
