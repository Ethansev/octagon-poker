'use client';

import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { centsToInput, toSeatData } from '@/app/(group)/nights/[id]/seat-data';
import { parseDollars } from '@/money/money';
import { removeSeatAction, saveSeatAction } from '@/nights/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type RowBase = { buyIn: string; cashOut: string; updatedAt: string | null };

function baseOf(seat: SeatData): RowBase {
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

export function useSeatRow(nightId: string, seat: SeatData, onGone: () => void) {
  const router = useRouter();
  const [base, setBase] = useState(() => baseOf(seat));
  const [buyIn, setBuyIn] = useState(base.buyIn);
  const [cashOut, setCashOut] = useState(base.cashOut);
  const [invalidField, setInvalidField] = useState<'buyIn' | 'cashOut' | null>(null);
  const [pending, startTransition] = useTransition();

  const buyInParsed = parseDollars(buyIn);
  const cashOutParsed = parseDollars(cashOut);
  const net =
    buyInParsed.kind === 'amount' && cashOutParsed.kind === 'amount'
      ? cashOutParsed.cents - buyInParsed.cents
      : null;
  const dirty = base.updatedAt === null || buyIn !== base.buyIn || cashOut !== base.cashOut;

  function adopt(next: RowBase) {
    setBase(next);
    setBuyIn(next.buyIn);
    setCashOut(next.cashOut);
  }

  function changeBuyIn(value: string) {
    setBuyIn(value);
    setInvalidField(null);
  }

  function changeCashOut(value: string) {
    setCashOut(value);
    setInvalidField(null);
  }

  function save() {
    if (!dirty) return;
    startTransition(async () => {
      const result = await saveSeatAction({
        nightId,
        playerId: seat.playerId,
        buyIn,
        cashOut,
        expectedUpdatedAt: base.updatedAt,
      });
      switch (result.kind) {
        case 'saved':
          adopt({
            buyIn: normalize(buyIn),
            cashOut: normalize(cashOut),
            updatedAt: result.updatedAt.toISOString(),
          });
          break;
        case 'conflict':
          adopt(baseOf(toSeatData(result.current)));
          toast.error(
            `Someone else just changed ${seat.playerName}'s row — showing their numbers.`,
          );
          break;
        case 'invalid':
          setInvalidField(result.field);
          break;
        case 'night-closed':
          toast.error('This night was just closed.');
          router.refresh();
          break;
        case 'not-found':
          toast.error(`Couldn't save ${seat.playerName}'s row.`);
          break;
      }
    });
  }

  function remove() {
    if (base.updatedAt === null) {
      onGone();
      return;
    }
    startTransition(async () => {
      const result = await removeSeatAction({ nightId, playerId: seat.playerId });
      if (result.kind === 'night-closed') toast.error('This night was just closed.');
      if (result.kind === 'removed') onGone();
      router.refresh();
    });
  }

  return {
    buyIn,
    cashOut,
    changeBuyIn,
    changeCashOut,
    net,
    dirty,
    invalidField,
    pending,
    save,
    remove,
  };
}
