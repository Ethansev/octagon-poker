'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { rebuyCount } from '@/app/(group)/nights/[id]/seat-data';
import type { SeatField } from '@/app/(group)/nights/[id]/use-seat-editor';
import {
  useSeatDraft,
  useSeatRemoval,
  useSeatSave,
} from '@/app/(group)/nights/[id]/use-seat-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import { Check, Lock, Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

type SeatEditorProps = {
  nightId: string;
  seat: SeatData;
  stepCents: number | null;
  isYou: boolean;
  focusField: SeatField | null;
  onSaved: () => void;
  onGone: () => void;
};

const roundButton =
  'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-ink transition hover:bg-ink hover:text-surface focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-ink motion-reduce:transition-none';

const chipButton =
  'h-11 cursor-pointer rounded-full bg-surface/80 px-3 text-sm font-extrabold tabular-nums transition hover:-translate-y-0.5 hover:bg-surface hover:shadow-card focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 motion-reduce:transition-none';

const cashOutSteps = [-2000, -500, 500, 2000];

function useFocusOnMount(field: SeatField | null) {
  const buyInRef = useRef<HTMLInputElement>(null);
  const cashOutRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input =
      field === 'buyIn' ? buyInRef.current : field === 'cashOut' ? cashOutRef.current : null;
    input?.focus();
    input?.select();
  }, [field]);

  return { buyInRef, cashOutRef };
}

function seatStatus(seat: SeatData, isYou: boolean): string {
  if (seat.updatedAt === null) return 'New at the table';
  if (isYou)
    return seat.cashOutCents === null
      ? 'That’s you. Still playing.'
      : 'That’s you. Already cashed out.';
  return seat.cashOutCents === null ? 'Still playing' : 'Cashed out. Fix anything below.';
}

function NetPreview({
  net,
  typo,
  invalid,
}: {
  net: number | null;
  typo: boolean;
  invalid: boolean;
}) {
  if (typo || invalid) {
    return <span className='text-error'>Enter an amount like 20 or 20.50</span>;
  }
  if (net === null)
    return <span className='text-ink-3'>Leave it blank while they’re still playing.</span>;
  if (net > 0) return <span className='text-win'>That’s {formatNet(net)} on the night</span>;
  if (net === 0) return <span className='text-ink-2'>Broke even. Free poker.</span>;
  return <span className='text-loss'>{formatNet(net)} tonight. Next one’s yours.</span>;
}

function RemoveSeat({
  name,
  needsConfirm,
  pending,
  onRemove,
}: {
  name: string;
  needsConfirm: boolean;
  pending: boolean;
  onRemove: () => void;
}) {
  const trigger = (
    <button
      type='button'
      disabled={pending}
      onClick={needsConfirm ? undefined : onRemove}
      className='mx-auto flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-bold text-ink-2 transition hover:bg-surface/70 hover:text-error focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:opacity-50'>
      <Trash2 aria-hidden className='size-4' />
      {needsConfirm ? 'Remove from night' : 'Not playing after all'}
    </button>
  );
  if (!needsConfirm) return trigger;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Take {name} off this night?</AlertDialogTitle>
          <AlertDialogDescription>
            Their buy-in and cash-out come off the books. You can add them back any time while the
            night is open.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep them</AlertDialogCancel>
          <AlertDialogAction variant='destructive' onClick={onRemove}>
            Remove {name}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SeatEditor({
  nightId,
  seat,
  stepCents,
  isYou,
  focusField,
  onSaved,
  onGone,
}: SeatEditorProps) {
  const draft = useSeatDraft(seat);
  const saving = useSeatSave(nightId, seat, draft, onSaved);
  const removal = useSeatRemoval(nightId, seat.playerId, draft, onGone);
  const { buyInRef, cashOutRef } = useFocusOnMount(focusField);
  const ids = useId();
  const color = playerColor(seat.colorSlot);
  const name = firstName(seat.playerName);
  const pending = saving.pending || removal.pending;
  const rebuys = rebuyCount(draft.buyInCents, stepCents);
  const buyInError = draft.typo.buyIn || draft.invalidField === 'buyIn';

  return (
    <form
      aria-label={`${seat.playerName}'s seat`}
      onSubmit={(event) => {
        event.preventDefault();
        saving.save();
      }}>
      <div className='flex items-center gap-3 pr-12'>
        <PlayerAvatar colorSlot={seat.colorSlot} name={seat.playerName} size={52} />
        <div className='min-w-0 flex-1'>
          <p className='flex items-center gap-2 text-2xl leading-tight font-bold tracking-tight'>
            <span className='truncate'>{seat.playerName}</span>
            {isYou && (
              <span className='rounded-full bg-ink px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-surface uppercase'>
                You
              </span>
            )}
          </p>
          <p className='text-sm font-bold text-ink-2'>{seatStatus(seat, isYou)}</p>
        </div>
      </div>

      <div className='mt-5 rounded-3xl bg-surface/70 p-4'>
        <div className='flex items-center justify-between gap-3'>
          <label
            htmlFor={`${ids}-buy-in`}
            className='text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'>
            Bought in
          </label>
          {rebuys !== null && rebuys > 0 && (
            <span className='text-xs font-extrabold text-ink-2'>
              {rebuys} {rebuys === 1 ? 'rebuy' : 'rebuys'}
            </span>
          )}
        </div>
        <div className='mt-1 flex items-center gap-2'>
          <span className='flex min-w-0 flex-1 items-baseline text-3xl font-bold tabular-nums'>
            <span aria-hidden className='text-ink-3'>
              $
            </span>
            <input
              ref={buyInRef}
              id={`${ids}-buy-in`}
              value={draft.buyIn}
              onChange={(event) => draft.changeBuyIn(event.target.value)}
              inputMode='decimal'
              autoComplete='off'
              placeholder='0'
              aria-invalid={buyInError}
              aria-describedby={buyInError ? `${ids}-buy-in-error` : undefined}
              className='w-full min-w-0 rounded-lg bg-transparent outline-none placeholder:text-ink-3/60 focus-visible:ring-4 focus-visible:ring-focus/30'
            />
          </span>
          {stepCents !== null && (
            <>
              <button
                type='button'
                aria-label={`Remove a ${formatDollars(stepCents)} rebuy`}
                disabled={draft.buyInCents === null || draft.buyInCents <= stepCents}
                onClick={() => draft.stepBuyIn(-stepCents, stepCents)}
                className={roundButton}>
                <Minus aria-hidden className='size-4' strokeWidth={3} />
              </button>
              <button
                type='button'
                onClick={() => draft.stepBuyIn(stepCents, stepCents)}
                className={cn(roundButton, 'w-auto gap-1 px-4 text-sm font-extrabold')}>
                <span className='inline-flex items-center gap-1'>
                  <Plus aria-hidden className='size-4' strokeWidth={3} />
                  Rebuy <span className='tabular-nums'>{formatDollars(stepCents)}</span>
                </span>
              </button>
            </>
          )}
        </div>
        {buyInError && (
          <p id={`${ids}-buy-in-error`} className='mt-1 text-sm font-bold text-error'>
            Enter a buy-in like 20 or 20.50
          </p>
        )}
      </div>

      <div className='mt-3 rounded-3xl bg-surface p-4 shadow-card focus-within:ring-4 focus-within:ring-focus/30 sm:p-5'>
        <label
          htmlFor={`${ids}-cash-out`}
          className='text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase'>
          Cashing out with
        </label>
        <span className='mt-1 flex items-baseline gap-1'>
          <span aria-hidden className='text-5xl font-bold text-ink-3'>
            $
          </span>
          <input
            ref={cashOutRef}
            id={`${ids}-cash-out`}
            value={draft.cashOut}
            onChange={(event) => draft.changeCashOut(event.target.value)}
            inputMode='decimal'
            autoComplete='off'
            placeholder='—'
            aria-invalid={draft.typo.cashOut || draft.invalidField === 'cashOut'}
            aria-describedby={`${ids}-net`}
            className='w-full min-w-0 bg-transparent text-6xl font-bold tracking-tight tabular-nums outline-none placeholder:text-ink-3/40'
          />
        </span>
        <p
          id={`${ids}-net`}
          aria-live='polite'
          className='mt-1 min-h-5 text-sm font-extrabold tabular-nums'>
          <NetPreview
            net={draft.net}
            typo={draft.typo.cashOut}
            invalid={draft.invalidField === 'cashOut'}
          />
        </p>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <button type='button' className={chipButton} onClick={() => draft.setCashOutCents(0)}>
          Busted
        </button>
        <button
          type='button'
          className={chipButton}
          disabled={draft.buyInCents === null}
          onClick={() => draft.buyInCents !== null && draft.setCashOutCents(draft.buyInCents)}>
          Broke even
        </button>
      </div>
      <div className='mt-2 grid grid-cols-4 gap-2'>
        {cashOutSteps.map((delta) => (
          <button
            key={delta}
            type='button'
            className={chipButton}
            aria-label={`${delta > 0 ? 'Add' : 'Take off'} ${formatDollars(Math.abs(delta))}`}
            onClick={() => draft.stepCashOut(delta)}>
            {delta > 0 ? '+' : '−'}
            {formatDollars(Math.abs(delta))}
          </button>
        ))}
      </div>

      <button
        type='submit'
        disabled={pending}
        className='mt-5 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-base font-extrabold shadow-lift transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none active:translate-y-0 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none'
        style={{ background: color.solid, color: color.ink }}>
        {saving.pending ? (
          'Saving…'
        ) : draft.dirty ? (
          <>
            <Lock aria-hidden className='size-4' strokeWidth={3} /> Lock it in
          </>
        ) : (
          <>
            <Check aria-hidden className='size-5' strokeWidth={3} /> Done
          </>
        )}
      </button>
      <div className='mt-2'>
        <RemoveSeat
          name={name}
          needsConfirm={removal.needsConfirm}
          pending={pending}
          onRemove={removal.remove}
        />
      </div>
    </form>
  );
}
