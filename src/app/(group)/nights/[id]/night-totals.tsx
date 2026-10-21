import { formatDollars } from '@/money/money';
import type { SeatView } from '@/nights/nights';
import type { NightBalance } from '@/stats/nights';
import { nightBalance } from '@/stats/nights';

function nameList(ids: string[], seats: SeatView[]): string {
  return ids
    .map((id) => seats.find((seat) => seat.playerId === id)?.playerName ?? 'Someone')
    .join(', ');
}

function leftToCountNote(balance: NightBalance, seats: SeatView[]): string {
  switch (balance.kind) {
    case 'empty':
      return 'No players yet';
    case 'missing-cash-out':
      return `Waiting on ${nameList(balance.playerIds, seats)}`;
    case 'off':
      return balance.outCents > balance.inCents
        ? `Cash-outs are ${formatDollars(balance.outCents - balance.inCents)} over buy-ins`
        : `Cash-outs are ${formatDollars(balance.inCents - balance.outCents)} short of buy-ins`;
    case 'balanced':
      return 'All counted';
  }
}

export function closeBlockedReason(seats: SeatView[]): string | null {
  const balance = nightBalance(seats);
  if (balance.kind === 'balanced') return null;
  if (balance.kind === 'empty') return 'Add players before closing the night.';
  if (balance.kind === 'missing-cash-out') {
    return `Can't close yet: waiting on a cash-out from ${nameList(balance.playerIds, seats)}.`;
  }
  return `Can't close yet: ${leftToCountNote(balance, seats).toLowerCase()}.`;
}

export function NightTotals({ seats }: { seats: SeatView[] }) {
  const balance = nightBalance(seats);
  const inCents = seats.reduce((sum, seat) => sum + seat.buyInCents, 0);
  const outCents = seats.reduce((sum, seat) => sum + (seat.cashOutCents ?? 0), 0);
  const left = Math.abs(inCents - outCents);

  return (
    <div className='rounded-xl border border-slate-200 p-3'>
      <div className='grid grid-cols-3 gap-2'>
        <Stat label='In' value={formatDollars(inCents)} />
        <Stat label='Out' value={formatDollars(outCents)} />
        <Stat label='Left to count' value={formatDollars(left)} />
      </div>
      <p className='mt-2 text-xs text-slate-500'>{leftToCountNote(balance, seats)}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
        {label}
      </div>
      <div className='text-lg font-bold text-slate-900'>{value}</div>
    </div>
  );
}
