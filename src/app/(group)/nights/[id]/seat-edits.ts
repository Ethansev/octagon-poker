import type { SeatData } from '@/app/(group)/nights/[id]/seat-data';
import { centsToInput } from '@/money/money';

export type SeatField = 'buyIn' | 'cashOut';

export type SeatBase = { buyIn: string; cashOut: string; updatedAt: string | null };

export type SeatEdit = {
  base: SeatBase;
  buyIn: string;
  cashOut: string;
  invalidField: SeatField | null;
};

export function baseOf(seat: SeatData): SeatBase {
  return {
    buyIn: centsToInput(seat.buyInCents),
    cashOut: centsToInput(seat.cashOutCents),
    updatedAt: seat.updatedAt,
  };
}

export function editFrom(base: SeatBase): SeatEdit {
  return { base, buyIn: base.buyIn, cashOut: base.cashOut, invalidField: null };
}

export function isDirty(edit: SeatEdit): boolean {
  return (
    edit.base.updatedAt === null ||
    edit.buyIn !== edit.base.buyIn ||
    edit.cashOut !== edit.base.cashOut
  );
}

function isNewer(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return false;
  return new Date(a).getTime() > new Date(b).getTime();
}

export function currentEdit(seat: SeatData, stored: SeatEdit | undefined): SeatEdit {
  if (!stored) return editFrom(baseOf(seat));
  if (isDirty(stored) || stored.invalidField !== null) return stored;
  return isNewer(stored.base.updatedAt, seat.updatedAt) ? stored : editFrom(baseOf(seat));
}
