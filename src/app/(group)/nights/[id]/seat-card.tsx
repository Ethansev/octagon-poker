import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { seatNetCents } from '@/app/(group)/nights/[id]/seat-data';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';

type SeatCardProps = {
  seat: SeatData;
  isYou: boolean;
  selected: boolean;
  onOpen: () => void;
};

function SeatOutcome({ seat }: { seat: SeatData }) {
  const net = seatNetCents(seat);
  if (seat.updatedAt === null) {
    return <span className='text-sm font-extrabold text-ink-2'>Not saved yet</span>;
  }
  if (net === null) {
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-extrabold text-pending'>
        <span aria-hidden className='size-2 rounded-full bg-pending' />
        Still playing
      </span>
    );
  }
  return (
    <span
      className={cn(
        'text-2xl leading-none font-bold tracking-tight tabular-nums',
        net > 0 ? 'text-win' : 'text-loss',
      )}>
      {formatNet(net)}
    </span>
  );
}

export function SeatCard({ seat, isYou, selected, onOpen }: SeatCardProps) {
  const color = playerColor(seat.colorSlot);
  const waiting = seat.cashOutCents === null;

  return (
    <button
      type='button'
      data-seat={seat.playerId}
      aria-pressed={selected}
      onClick={onOpen}
      className={cn(
        'group flex h-full w-full cursor-pointer flex-col items-start gap-3 rounded-card p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:p-4',
        !selected && 'bg-surface-2 hover:bg-surface-3',
      )}
      style={
        selected
          ? { background: color.soft, boxShadow: `inset 0 0 0 2px ${color.solid}` }
          : undefined
      }>
      <span className='flex w-full min-w-0 items-center gap-2.5'>
        <span className='relative shrink-0'>
          <PlayerAvatar colorSlot={seat.colorSlot} name={seat.playerName} size={44} />
          {waiting && (
            <span
              aria-hidden
              className='absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-[3px] border-ring-gap bg-pending'
            />
          )}
        </span>
        <span className='flex min-w-0 flex-1 items-center gap-1.5'>
          <span className='truncate font-extrabold'>{seat.playerName}</span>
          {isYou && (
            <span className='shrink-0 rounded-full bg-ink px-1.5 py-px text-[10px] font-extrabold tracking-wider text-surface uppercase'>
              You
            </span>
          )}
        </span>
      </span>
      <span className='block w-full text-xs font-bold text-ink-2 tabular-nums'>
        {seat.buyInCents === null ? 'No buy-in yet' : `${formatDollars(seat.buyInCents)} in`}
        {seat.cashOutCents !== null && ` · ${formatDollars(seat.cashOutCents)} out`}
      </span>
      <span className='mt-auto'>
        <SeatOutcome seat={seat} />
      </span>
    </button>
  );
}
