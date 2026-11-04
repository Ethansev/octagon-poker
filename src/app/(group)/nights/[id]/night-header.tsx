import { formatDollars } from '@/money/money';
import { formatNightDate, formatNightTime } from '@/nights/dates';
import type { NightPhase } from '@/nights/night-phase';
import { MapPin } from 'lucide-react';

type NightHeaderProps = {
  phase: NightPhase;
  date: string;
  startTime: string | null;
  location: string | null;
  potCents: number;
  playerCount: number;
  buyInCents: number | null;
};

function StatusPill({ phase }: { phase: NightPhase }) {
  if (phase === 'upcoming') {
    return (
      <span className='rounded-full bg-surface-3 px-3 py-1 text-xs font-extrabold tracking-[0.12em] text-ink uppercase'>
        Upcoming
      </span>
    );
  }
  if (phase === 'closed') {
    return (
      <span className='rounded-full bg-ink px-3 py-1 text-xs font-extrabold tracking-[0.12em] text-surface uppercase'>
        In the books
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-2 rounded-full bg-live px-3 py-1 text-xs font-extrabold tracking-[0.12em] text-live-ink uppercase'>
      <span aria-hidden className='relative flex size-2'>
        <span className='absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75 motion-reduce:animate-none' />
        <span className='relative inline-flex size-2 rounded-full bg-current' />
      </span>
      Live
    </span>
  );
}

export function NightHeader({
  phase,
  date,
  startTime,
  location,
  potCents,
  playerCount,
  buyInCents,
}: NightHeaderProps) {
  const stats = [
    ...(phase === 'upcoming' ? [] : [{ label: 'pot', value: formatDollars(potCents) }]),
    ...(phase === 'upcoming' && playerCount === 0
      ? []
      : [{ label: playerCount === 1 ? 'player' : 'players', value: String(playerCount) }]),
    ...(buyInCents === null ? [] : [{ label: 'buy-in', value: formatDollars(buyInCents) }]),
  ];

  return (
    <>
      <header className='flex flex-col gap-4 lg:mt-6 lg:flex-row lg:items-end lg:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <StatusPill phase={phase} />
            <span className='text-sm font-extrabold tracking-[0.12em] text-ink-2 uppercase'>
              {formatNightDate(date)}
              {startTime !== null && ` · ${formatNightTime(startTime)}`}
            </span>
          </div>
          <h1 className='mt-2 text-5xl leading-none font-bold tracking-tight break-words sm:text-6xl'>
            {location ? (
              <>
                <MapPin
                  aria-hidden
                  className='mr-1 mb-2 inline size-9 text-primary sm:size-11'
                  strokeWidth={2.5}
                />
                {location}
              </>
            ) : (
              'Poker night'
            )}
          </h1>
        </div>
        <ul aria-label='Night stats' className='flex gap-2 sm:flex-wrap'>
          {stats.map((stat) => (
            <li
              key={stat.label}
              className='min-w-0 flex-1 rounded-2xl bg-surface px-3 py-2 shadow-card sm:flex-none sm:px-4'>
              <span className='block text-2xl font-bold tabular-nums sm:inline'>{stat.value}</span>{' '}
              <span className='text-sm font-bold text-ink-2'>{stat.label}</span>
            </li>
          ))}
        </ul>
      </header>
    </>
  );
}
