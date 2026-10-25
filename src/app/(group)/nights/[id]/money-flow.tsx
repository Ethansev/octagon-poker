import type { ResultSeat } from '@/app/(group)/nights/[id]/load-night';
import { formatDollars } from '@/money/money';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import { Equal } from 'lucide-react';

const LABEL_MIN_SHARE = 11;

function FlowBar({
  label,
  seats,
  amount,
  totalCents,
  dimLosers,
}: {
  label: string;
  seats: ResultSeat[];
  amount: (seat: ResultSeat) => number;
  totalCents: number;
  dimLosers: boolean;
}) {
  const shown = seats.filter((seat) => amount(seat) > 0);
  return (
    <div>
      <p className='mb-1.5 text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase'>
        {label}
      </p>
      {shown.length === 0 ? (
        <div className='grid h-11 place-items-center rounded-2xl bg-surface-3 text-xs font-bold text-ink-3'>
          Nothing
        </div>
      ) : (
        <ul className='flex h-11 gap-1 overflow-hidden rounded-2xl'>
          {shown.map((seat) => {
            const color = playerColor(seat.colorSlot);
            const share = totalCents > 0 ? (amount(seat) / totalCents) * 100 : 0;
            const dim = dimLosers && seat.netCents <= 0;
            return (
              <li
                key={seat.playerId}
                title={`${seat.name}: ${formatDollars(amount(seat))}`}
                className='grid min-w-1.5 place-items-center overflow-hidden text-xs font-extrabold whitespace-nowrap'
                style={{
                  width: `${share}%`,
                  background: dim ? color.soft : color.solid,
                  color: dim ? color.deep : color.ink,
                }}>
                <span className={share > LABEL_MIN_SHARE ? undefined : 'sr-only'}>
                  {firstName(seat.name)}
                  <span className='sr-only'> {formatDollars(amount(seat))}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StartTile({ seats }: { seats: ResultSeat[] }) {
  const deepest = [...seats].sort((a, b) => b.buyInCents - a.buyInCents)[0];
  if (!deepest) return null;
  const evenStart = seats.every((seat) => seat.buyInCents === deepest.buyInCents);

  return (
    <div className='rounded-3xl bg-surface-3 p-4'>
      <p className='text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'>
        {evenStart ? 'Even start' : 'Deepest pockets'}
      </p>
      <div className='mt-2 flex h-8 items-center'>
        {evenStart ? (
          <span className='grid size-8 place-items-center rounded-full bg-surface text-ink-2'>
            <Equal aria-hidden className='size-4' strokeWidth={3} />
          </span>
        ) : (
          <PlayerAvatar colorSlot={deepest.colorSlot} name={deepest.name} size={32} />
        )}
      </div>
      <p className='mt-2 text-sm font-bold'>
        {evenStart ? 'Everyone in for ' : `${firstName(deepest.name)}, `}
        <span className='tabular-nums'>{formatDollars(deepest.buyInCents)}</span>
        {evenStart ? '' : ' in'}
      </p>
    </div>
  );
}

export function MoneyFlow({ seats, potCents }: { seats: ResultSeat[]; potCents: number }) {
  const takers = seats.filter((seat) => seat.netCents > 0);

  return (
    <section
      aria-labelledby='flow-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 id='flow-heading' className='text-2xl font-bold tracking-tight'>
            How the money moved
          </h2>
          <p className='text-sm font-semibold text-ink-2'>Who put it in, who took it home.</p>
        </div>
        <div className='text-right'>
          <p className='text-2xl leading-none font-bold tabular-nums sm:text-3xl'>
            {formatDollars(potCents)}
          </p>
          <p className='text-xs font-extrabold tracking-wider text-ink-2 uppercase'>pot</p>
        </div>
      </div>
      <div className='mt-5 space-y-4'>
        <FlowBar
          label='Bought in'
          seats={seats}
          amount={(seat) => seat.buyInCents}
          totalCents={potCents}
          dimLosers={false}
        />
        <FlowBar
          label='Cashed out'
          seats={seats}
          amount={(seat) => seat.cashOutCents}
          totalCents={potCents}
          dimLosers
        />
      </div>
      <div className='mt-5 grid grid-cols-2 gap-3'>
        <div className='rounded-3xl bg-surface-3 p-4'>
          <p className='text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'>
            Went home up
          </p>
          <div className='mt-2 flex h-8 -space-x-2'>
            {takers.map((seat) => (
              <span key={seat.playerId} className='rounded-full ring-2 ring-surface-3'>
                <PlayerAvatar colorSlot={seat.colorSlot} name={seat.name} size={32} />
              </span>
            ))}
          </div>
          <p className='mt-2 text-sm font-bold'>
            {takers.length === 0
              ? 'Nobody this time'
              : `${takers.length} ${takers.length === 1 ? 'player' : 'players'}`}
          </p>
        </div>
        <StartTile seats={seats} />
      </div>
    </section>
  );
}
