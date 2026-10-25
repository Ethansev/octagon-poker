'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { rowGrid } from '@/app/(group)/nights/[id]/seat-grid';
import { useSeatRow } from '@/app/(group)/nights/[id]/use-seat-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNet } from '@/money/money';
import { X } from 'lucide-react';

type SeatRowProps = {
  nightId: string;
  seat: SeatData;
  onSubmitted: () => void;
  onGone: () => void;
};

export function SeatRow({ nightId, seat, onSubmitted, onGone }: SeatRowProps) {
  const row = useSeatRow(nightId, seat, onGone);

  return (
    <form
      className={`${rowGrid} border-b border-line/60 py-2`}
      onSubmit={(event) => {
        event.preventDefault();
        row.save();
        onSubmitted();
      }}>
      <span className='col-span-2 truncate font-semibold text-ink sm:col-span-1'>
        {seat.playerName}
      </span>
      <Input
        data-seat-input={seat.playerId}
        data-field='buyIn'
        autoFocus={seat.updatedAt === null}
        aria-label={`${seat.playerName} buy-in`}
        placeholder='Buy-in'
        inputMode='decimal'
        value={row.buyIn}
        aria-invalid={row.invalidField === 'buyIn'}
        onChange={(event) => row.changeBuyIn(event.target.value)}
        className='col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto'
      />
      <Input
        data-seat-input={seat.playerId}
        data-field='cashOut'
        aria-label={`${seat.playerName} cash-out`}
        placeholder='Cash-out'
        inputMode='decimal'
        value={row.cashOut}
        aria-invalid={row.invalidField === 'cashOut'}
        onChange={(event) => row.changeCashOut(event.target.value)}
        className='col-start-2 row-start-2 sm:col-start-auto sm:row-start-auto'
      />
      <span
        className={`col-start-3 row-start-1 text-right font-bold tabular-nums sm:col-start-auto sm:row-start-auto ${
          row.net !== null && row.net > 0 ? 'text-win' : 'text-loss'
        }`}>
        {row.net === null ? '' : formatNet(row.net)}
      </span>
      <div className='col-start-3 row-start-2 flex items-center justify-end gap-1 sm:col-start-auto sm:row-start-auto'>
        <Button
          type='submit'
          tabIndex={-1}
          size='sm'
          variant={row.dirty ? 'default' : 'secondary'}
          disabled={row.pending}>
          {row.dirty ? 'Save' : 'Saved'}
        </Button>
        <Button
          type='button'
          tabIndex={-1}
          size='icon'
          variant='ghost'
          className='size-8'
          aria-label={`Remove ${seat.playerName}`}
          disabled={row.pending}
          onClick={row.remove}>
          <X />
        </Button>
      </div>
      {row.invalidField !== null && (
        <p className='col-span-full text-sm text-error'>Enter an amount like 20 or 20.50</p>
      )}
    </form>
  );
}
