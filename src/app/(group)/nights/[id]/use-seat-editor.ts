'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { centsToInput, stepAmount, toSeatData } from '@/app/(group)/nights/[id]/seat-data';
import { parseDollars } from '@/money/money';
import { removeSeatAction, saveSeatAction } from '@/nights/actions';
import { firstName } from '@/players/first-name';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export type SeatField = 'buyIn' | 'cashOut';

type SeatBase = { buyIn: string; cashOut: string; updatedAt: string | null };

function baseOf(seat: SeatData): SeatBase {
  return {
    buyIn: centsToInput(seat.buyInCents),
    cashOut: centsToInput(seat.cashOutCents),
    updatedAt: seat.updatedAt,
  };
}

function normalize(text: string): string {
  const parsed = parseDollars(text);
  return parsed.kind === 'amount' ? centsToInput(parsed.cents) : '';
}

function centsOf(text: string): number | null {
  const parsed = parseDollars(text);
  return parsed.kind === 'amount' ? parsed.cents : null;
}

export function useSeatDraft(seat: SeatData) {
  const [base, setBase] = useState(() => baseOf(seat));
  const [buyIn, setBuyIn] = useState(base.buyIn);
  const [cashOut, setCashOut] = useState(base.cashOut);
  const [invalidField, setInvalidField] = useState<SeatField | null>(null);

  const buyInCents = centsOf(buyIn);
  const cashOutCents = centsOf(cashOut);

  function changeBuyIn(value: string) {
    setBuyIn(value);
    if (invalidField === 'buyIn') setInvalidField(null);
  }

  function changeCashOut(value: string) {
    setCashOut(value);
    if (invalidField === 'cashOut') setInvalidField(null);
  }

  function adopt(next: SeatBase) {
    setBase(next);
    setBuyIn(next.buyIn);
    setCashOut(next.cashOut);
  }

  return {
    base,
    buyIn,
    cashOut,
    buyInCents,
    cashOutCents,
    typo: {
      buyIn: parseDollars(buyIn).kind === 'invalid',
      cashOut: parseDollars(cashOut).kind === 'invalid',
    },
    net: buyInCents !== null && cashOutCents !== null ? cashOutCents - buyInCents : null,
    dirty: base.updatedAt === null || buyIn !== base.buyIn || cashOut !== base.cashOut,
    invalidField,
    markInvalid: setInvalidField,
    changeBuyIn,
    changeCashOut,
    stepBuyIn: (deltaCents: number, floorCents: number) =>
      changeBuyIn(stepAmount(buyIn, deltaCents, floorCents)),
    stepCashOut: (deltaCents: number) => changeCashOut(stepAmount(cashOut, deltaCents, 0)),
    setCashOutCents: (cents: number) => changeCashOut(centsToInput(cents)),
    adopt,
  };
}

type SeatDraft = ReturnType<typeof useSeatDraft>;

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
