import type { ResultSeat } from '@/app/(group)/nights/[id]/load-night';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import Link from 'next/link';

type Tone = 'won' | 'up' | 'even' | 'down';

function toneOf(seat: ResultSeat): Tone {
  if (seat.won) return 'won';
  if (seat.netCents > 0) return 'up';
  if (seat.netCents === 0) return 'even';
  return 'down';
}

const toneClass: Record<Tone, string> = {
  won: 'pr-5',
  up: 'text-ink',
  even: 'bg-surface text-ink ring-2 ring-line ring-inset',
  down: 'bg-surface-3 text-ink-2',
};

export function ResultChips({ seats }: { seats: ResultSeat[] }) {
  const up = seats.filter((seat) => seat.netCents > 0).length;

  return (
    <section
      aria-labelledby='results-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='results-heading' className='text-2xl font-bold tracking-tight'>
        Everyone’s night
      </h2>
      <p className='text-sm font-semibold text-ink-2'>
        {up} of {seats.length} went home up
      </p>
      <ul className='mt-4 flex flex-wrap gap-2.5'>
        {seats.map((seat) => {
          const tone = toneOf(seat);
          const color = playerColor(seat.colorSlot);
          return (
            <li key={seat.playerId}>
              <Link
                href={`/players/${seat.playerId}`}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
                  toneClass[tone],
                )}
                style={
                  tone === 'won'
                    ? { background: color.solid, color: color.ink }
                    : tone === 'up'
                      ? { background: color.soft }
                      : undefined
                }>
                <span
                  className={tone === 'won' ? 'rounded-full p-0.5' : undefined}
                  style={tone === 'won' ? { background: color.glow } : undefined}>
                  <PlayerAvatar
                    colorSlot={seat.colorSlot}
                    name={seat.name}
                    size={tone === 'won' ? 44 : 36}
                    tone={tone === 'down' ? 'muted' : 'solid'}
                  />
                </span>
                <span className='leading-tight'>
                  <span className='flex items-baseline gap-2'>
                    <span className='font-extrabold'>{seat.name}</span>
                    <span
                      className={cn(
                        'font-bold tabular-nums',
                        tone === 'won' ? 'text-xl' : 'text-lg',
                        tone === 'up' && 'text-win',
                        tone === 'down' && 'text-loss',
                      )}>
                      {formatNet(seat.netCents)}
                    </span>
                    {tone === 'won' && <span aria-hidden>🏆</span>}
                  </span>
                  <span
                    className={cn(
                      'block text-xs font-bold tabular-nums',
                      tone === 'won' ? 'opacity-80' : 'text-ink-3',
                    )}>
                    {formatDollars(seat.buyInCents)} in · {formatDollars(seat.cashOutCents)} out
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
