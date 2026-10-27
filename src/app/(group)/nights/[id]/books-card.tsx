import { BankPicker } from '@/app/(group)/nights/[id]/bank-picker';
import { CloseNightButton } from '@/app/(group)/nights/[id]/close-night-button';
import { LiveDot } from '@/components/live-dot';
import { formatDollars } from '@/money/money';
import { balanceNote, closeBlockedReason } from '@/nights/balance-copy';
import type { SeatView } from '@/nights/nights';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import type { NightBalance } from '@/stats/nights';
import { nightBalance } from '@/stats/nights';
import { Landmark } from 'lucide-react';

type BooksCardProps = {
  nightId: string;
  seats: SeatView[];
  bankPlayerId: string | null;
  canClose: boolean;
};

function headline(balance: NightBalance, seats: SeatView[]): string {
  if (balance.kind === 'empty') return 'Nobody’s sat down yet';
  const done = seats.filter((seat) => seat.cashOutCents !== null).length;
  return `${done} of ${seats.length} cashed out`;
}

function BankRow({
  nightId,
  seats,
  bankPlayerId,
  inCents,
}: {
  nightId: string;
  seats: SeatView[];
  bankPlayerId: string | null;
  inCents: number;
}) {
  const bank = seats.find((seat) => seat.playerId === bankPlayerId);

  return (
    <div className='mt-5 flex flex-col gap-3 rounded-3xl bg-surface-2 p-4 sm:flex-row sm:items-center'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <span
          aria-hidden
          className='grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink'>
          <Landmark className='size-5' />
        </span>
        <div className='min-w-0'>
          <p className='text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase'>The bank</p>
          <p className='text-sm font-bold'>
            {bank ? (
              <>
                {firstName(bank.playerName)} should be holding{' '}
                <span className='tabular-nums'>{formatDollars(inCents)}</span>
              </>
            ) : (
              'Who’s holding the money tonight?'
            )}
          </p>
        </div>
      </div>
      <BankPicker nightId={nightId} seats={seats} bankPlayerId={bankPlayerId} />
    </div>
  );
}

function BooksNote({
  balance,
  seats,
  gap,
}: {
  balance: NightBalance;
  seats: SeatView[];
  gap: number;
}) {
  switch (balance.kind) {
    case 'empty':
      return <>Add the first player to get the night going.</>;
    case 'missing-cash-out':
      return (
        <>
          <span className='tabular-nums'>{formatDollars(Math.max(gap, 0))}</span> still on the
          table. {balanceNote(balance, seats)}.
        </>
      );
    case 'off':
      return <>{balanceNote(balance, seats)}. Someone double-check the counts.</>;
    case 'balanced':
      return <>Books balance to the dollar. Ready to close.</>;
  }
}

export function BooksCard({ nightId, seats, bankPlayerId, canClose }: BooksCardProps) {
  const balance = nightBalance(seats);
  const inCents = seats.reduce((sum, seat) => sum + seat.buyInCents, 0);
  const outCents = seats.reduce((sum, seat) => sum + (seat.cashOutCents ?? 0), 0);
  const progress = inCents > 0 ? Math.min(100, Math.round((outCents / inCents) * 100)) : 0;
  const waiting = seats.filter((seat) => seat.cashOutCents === null);

  return (
    <section
      aria-labelledby='books-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <p className='inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-live uppercase'>
        <LiveDot />
        Live books
      </p>
      <h2
        id='books-heading'
        className='mt-2 text-3xl leading-none font-bold tracking-tight tabular-nums sm:text-4xl'>
        {headline(balance, seats)}
      </h2>

      <div className='mt-5'>
        <div
          role='progressbar'
          aria-label='Cashed out so far'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className='h-4 overflow-hidden rounded-full bg-surface-3'>
          <div
            className='h-full rounded-full bg-live transition-[width] duration-500 motion-reduce:transition-none'
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='mt-2 flex justify-between text-sm font-bold text-ink-2 tabular-nums'>
          <span>{formatDollars(outCents)} out</span>
          <span>{formatDollars(inCents)} in</span>
        </div>
      </div>

      {seats.length > 0 && (
        <BankRow nightId={nightId} seats={seats} bankPlayerId={bankPlayerId} inCents={inCents} />
      )}

      <p
        className={
          balance.kind === 'off'
            ? 'mt-4 rounded-2xl bg-error-soft px-4 py-3 text-sm font-bold text-error'
            : 'mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-sm font-bold'
        }>
        <BooksNote balance={balance} seats={seats} gap={inCents - outCents} />
      </p>

      {waiting.length > 0 && (
        <div className='mt-4'>
          <p className='text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase'>
            Waiting on
          </p>
          <ul className='mt-2 flex flex-wrap gap-2'>
            {waiting.map((seat) => (
              <li
                key={seat.playerId}
                className='inline-flex items-center gap-2 rounded-full border-2 border-dashed border-line py-1 pr-3 pl-1 text-sm font-extrabold'>
                <PlayerAvatar colorSlot={seat.playerColorSlot} name={seat.playerName} size={26} />
                {firstName(seat.playerName)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canClose ? (
        <CloseNightButton
          nightId={nightId}
          blockedReason={closeBlockedReason(seats, bankPlayerId)}
        />
      ) : (
        <p className='mt-5 text-sm font-semibold text-ink-3'>
          The host closes the night once the books balance.
        </p>
      )}
    </section>
  );
}
