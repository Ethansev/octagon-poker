import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { seatNetCents } from '@/app/(group)/nights/[id]/seat-data';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import { Landmark, PencilLine } from 'lucide-react';

type SeatCardProps = {
  seat: SeatData;
  isYou: boolean;
  isBank: boolean;
  selected: boolean;
  unsaved: boolean;
  onOpen: () => void;
};

function SeatOutcome({ seat }: { seat: SeatData }) {
  const net = seatNetCents(seat);
  if (net === null) {
    return (
      <span className='inline-flex items-center gap-1.5 text-sm font-extrabold text-pending'>
        <span aria-hidden className='size-2 rounded-full bg-pending' />
        Still playing
      </span>
    );
  }
  if (net === 0) {
    return <span className='text-2xl leading-none font-bold tracking-tight text-ink-2'>Even</span>;
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

function UnsavedChip() {
  return (
    <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-ink-2 uppercase shadow-card'>
      <PencilLine aria-hidden className='size-3' />
      Unsaved
    </span>
  );
}

function SeatSummary({ seat, unsaved }: { seat: SeatData; unsaved: boolean }) {
  return (
    <>
      <span className='block w-full text-xs font-bold text-ink-2 tabular-nums'>
        {seat.buyInCents === null ? 'No buy-in yet' : `${formatDollars(seat.buyInCents)} in`}
        {seat.cashOutCents !== null && ` · ${formatDollars(seat.cashOutCents)} out`}
      </span>
      <span className='mt-auto flex w-full flex-wrap items-center justify-between gap-2'>
        <SeatOutcome seat={seat} />
        {unsaved && <UnsavedChip />}
      </span>
    </>
  );
}

function NewSeatSummary() {
  return (
    <>
      <span className='block w-full text-xs font-bold text-ink-3'>Buy-in not locked in</span>
      <span className='mt-auto text-sm font-extrabold text-ink-2'>Not saved yet</span>
    </>
  );
}

export function SeatCard({ seat, isYou, isBank, selected, unsaved, onOpen }: SeatCardProps) {
  const color = playerColor(seat.colorSlot);
  const isNew = seat.updatedAt === null;
  const waiting = !isNew && seat.cashOutCents === null;

  return (
    <button
      type='button'
      data-seat={seat.playerId}
      aria-pressed={selected}
      onClick={onOpen}
      className={cn(
        'group flex h-full w-full cursor-pointer flex-col items-start gap-3 rounded-card p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:p-4',
        !selected && !isNew && 'bg-surface-2 hover:bg-surface-3',
        !selected && isNew && 'border-2 border-dashed border-line hover:bg-surface-2',
      )}
      style={
        selected
          ? { background: color.soft, boxShadow: `inset 0 0 0 2px ${color.solid}` }
          : undefined
      }>
      <span className='flex w-full min-w-0 items-center gap-2.5'>
        <span className='relative shrink-0'>
          <PlayerAvatar
            colorSlot={seat.colorSlot}
            name={seat.playerName}
            size={44}
            tone={isNew ? 'muted' : 'solid'}
          />
          {waiting && (
            <span
              aria-hidden
              className='absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-[3px] border-ring-gap bg-pending'
            />
          )}
        </span>
        <span className='flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5'>
          <span className='max-w-full truncate font-extrabold'>{seat.playerName}</span>
          {isYou && (
            <span className='shrink-0 rounded-full bg-ink px-1.5 py-px text-[10px] font-extrabold tracking-wider text-surface uppercase'>
              You
            </span>
          )}
          {isBank && (
            <span className='inline-flex shrink-0 items-center gap-0.5 rounded-full bg-surface-3 px-1.5 py-px text-[10px] font-extrabold tracking-wider text-ink-2 uppercase'>
              <Landmark aria-hidden className='size-2.5' strokeWidth={3} />
              Bank
            </span>
          )}
        </span>
      </span>
      {isNew ? <NewSeatSummary /> : <SeatSummary seat={seat} unsaved={unsaved} />}
    </button>
  );
}
