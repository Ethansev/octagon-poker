import type { SeasonPlayer } from '@/app/(group)/season-players';
import { Sparkline } from '@/charts/sparkline';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import Link from 'next/link';

function Stat({ label, value, up }: { label: string; value: string; up: boolean }) {
  return (
    <div className='flex min-w-0 flex-col-reverse'>
      <dt className={cn('text-xs font-bold', up ? 'text-ink-2' : 'text-ink-3')}>{label}</dt>
      <dd className='truncate text-lg font-bold tabular-nums'>{value}</dd>
    </div>
  );
}

export function PlayerCard({ player, year }: { player: SeasonPlayer; year: number }) {
  const color = playerColor(player.colorSlot);
  const up = player.netCents > 0;

  return (
    <li>
      <Link
        href={`/players/${player.playerId}?season=${year}`}
        className={cn(
          'group flex h-full cursor-pointer flex-col rounded-card border p-5 transition hover:-translate-y-1 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
          up ? 'border-transparent' : 'border-line bg-surface-3 text-ink-2',
        )}
        style={up ? { background: color.soft } : undefined}>
        <div className='flex items-center gap-3'>
          <span className='relative'>
            {player.rank === 1 && (
              <span
                aria-hidden
                className='absolute -top-4 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-xl'>
                👑
              </span>
            )}
            <PlayerAvatar
              colorSlot={player.colorSlot}
              name={player.name}
              size={52}
              tone={up ? 'solid' : 'muted'}
              ring={up ? 3 : 0}
            />
          </span>
          <span className='min-w-0 flex-1'>
            <span className={cn('block truncate text-lg font-bold', up && 'text-ink')}>
              {player.name}
            </span>
            <span
              className={cn(
                'block text-xs font-extrabold tracking-[0.12em] uppercase',
                up ? 'text-ink-2' : 'text-ink-3',
              )}>
              {player.rank === null ? 'Unranked' : `No. ${player.rank}`}
            </span>
          </span>
        </div>
        <div className='mt-4 flex items-end justify-between gap-3'>
          <p
            className={cn(
              'text-4xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums',
              up ? 'text-win' : 'text-loss',
            )}>
            {formatNet(player.netCents)}
          </p>
          <span className={up ? 'text-ink' : 'text-ink-3'}>
            <Sparkline
              nets={player.history.map((entry) => entry.netCents)}
              stroke={up ? color.solid : 'var(--loss-soft)'}
              width={96}
              height={34}
            />
          </span>
        </div>
        <dl
          className={cn(
            'mt-4 grid grid-cols-3 gap-2 border-t pt-3',
            up ? 'border-current/10 text-ink' : 'border-line',
          )}>
          <Stat
            label={player.nightsPlayed === 1 ? 'night' : 'nights'}
            value={String(player.nightsPlayed)}
            up={up}
          />
          <Stat
            label={player.nightsWon === 1 ? 'win' : 'wins'}
            value={String(player.nightsWon)}
            up={up}
          />
          <Stat
            label='best night'
            value={player.biggestNight ? formatNet(player.biggestNight.netCents) : '—'}
            up={up}
          />
        </dl>
      </Link>
    </li>
  );
}
