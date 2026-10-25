'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { centsToInput, stepAmount, toSeatData } from '@/app/(group)/nights/[id]/seat-data';
import type { SeatBase, SeatEdit, SeatField } from '@/app/(group)/nights/[id]/seat-edits';
import { baseOf, currentEdit, editFrom, isDirty } from '@/app/(group)/nights/[id]/seat-edits';
import { parseDollars } from '@/money/money';
import { removeSeatAction, saveSeatAction } from '@/nights/actions';
import { firstName } from '@/players/first-name';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

function normalize(text: string): string {
  const parsed = parseDollars(text);
  return parsed.kind === 'amount' ? centsToInput(parsed.cents) : '';
}

function centsOf(text: string): number | null {
  const parsed = parseDollars(text);
  return parsed.kind === 'amount' ? parsed.cents : null;
}

export function useSeatEdits() {
  const [edits, setEdits] = useState<Record<string, SeatEdit>>({});

  function updateEdit(seat: SeatData, change: (edit: SeatEdit) => SeatEdit) {
    setEdits((current) => ({
      ...current,
      [seat.playerId]: change(currentEdit(seat, current[seat.playerId])),
    }));
  }

  function adopt(playerId: string, base: SeatBase) {
    setEdits((current) => ({ ...current, [playerId]: editFrom(base) }));
  }

  function forget(playerId: string) {
    setEdits((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => id !== playerId)),
    );
  }

  return {
    editFor: (seat: SeatData) => currentEdit(seat, edits[seat.playerId]),
    updateEdit,
    adopt,
    forget,
  };
}

export type SeatEdits = ReturnType<typeof useSeatEdits>;

function clearing(edit: SeatEdit, field: SeatField): SeatField | null {
  return edit.invalidField === field ? null : edit.invalidField;
}

export function seatDraft(seat: SeatData, edits: SeatEdits) {
  const edit = edits.editFor(seat);
  const buyInCents = centsOf(edit.buyIn);
  const cashOutCents = centsOf(edit.cashOut);
  const update = (change: (edit: SeatEdit) => SeatEdit) => edits.updateEdit(seat, change);
  const changeCashOut = (next: (edit: SeatEdit) => string) =>
    update((current) => ({
      ...current,
      cashOut: next(current),
      invalidField: clearing(current, 'cashOut'),
    }));
  const changeBuyIn = (next: (edit: SeatEdit) => string) =>
    update((current) => ({
      ...current,
      buyIn: next(current),
      invalidField: clearing(current, 'buyIn'),
    }));

  return {
    base: edit.base,
    buyIn: edit.buyIn,
    cashOut: edit.cashOut,
    buyInCents,
    cashOutCents,
    typo: {
      buyIn: parseDollars(edit.buyIn).kind === 'invalid',
      cashOut: parseDollars(edit.cashOut).kind === 'invalid',
    },
    net: buyInCents !== null && cashOutCents !== null ? cashOutCents - buyInCents : null,
    dirty: isDirty(edit),
    invalidField: edit.invalidField,
    markInvalid: (field: SeatField) => update((current) => ({ ...current, invalidField: field })),
    changeBuyIn: (value: string) => changeBuyIn(() => value),
    changeCashOut: (value: string) => changeCashOut(() => value),
    stepBuyIn: (deltaCents: number, floorCents: number) =>
      changeBuyIn((current) => stepAmount(current.buyIn, deltaCents, floorCents)),
    stepCashOut: (deltaCents: number) =>
      changeCashOut((current) => stepAmount(current.cashOut, deltaCents, 0)),
    setCashOutCents: (cents: number) => changeCashOut(() => centsToInput(cents)),
    adopt: (base: SeatBase) => edits.adopt(seat.playerId, base),
  };
}

type SeatDraft = ReturnType<typeof seatDraft>;

export function useSeatSave(
  nightId: string,
  seat: SeatData,
  draft: SeatDraft,
  onSaved: () => void,
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const name = firstName(seat.playerName);

  function save() {
    if (!draft.dirty) {
      onSaved();
      return;
    }
    const { buyIn, cashOut } = draft;
    startTransition(async () => {
      const result = await saveSeatAction({
        nightId,
        playerId: seat.playerId,
        buyIn,
        cashOut,
        expectedUpdatedAt: draft.base.updatedAt,
      });
      switch (result.kind) {
        case 'saved':
          draft.adopt({
            buyIn: normalize(buyIn),
            cashOut: normalize(cashOut),
            updatedAt: result.updatedAt.toISOString(),
          });
          toast.success(`${name}'s seat is locked in.`);
          onSaved();
          break;
        case 'conflict':
          draft.adopt(baseOf(toSeatData(result.current)));
          toast.error(`Someone else just changed ${name}'s seat. Showing their numbers.`);
          break;
        case 'invalid':
          draft.markInvalid(result.field);
          break;
        case 'night-closed':
          toast.error('This night was just closed.');
          router.refresh();
          break;
        case 'not-found':
          toast.error(`Couldn't save ${name}'s seat.`);
          break;
      }
    });
  }

  return { pending, save };
}

export function useSeatRemoval(
  nightId: string,
  playerId: string,
  draft: SeatDraft,
  onGone: () => void,
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const saved = draft.base.updatedAt !== null;

  function remove() {
    if (!saved) {
      onGone();
      return;
    }
    startTransition(async () => {
      const result = await removeSeatAction({ nightId, playerId });
      if (result.kind === 'night-closed') toast.error('This night was just closed.');
      if (result.kind === 'removed') onGone();
      router.refresh();
    });
  }

  return { pending, remove, needsConfirm: saved };
}
