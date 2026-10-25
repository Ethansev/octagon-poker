import { parseDollars } from '@/money/money';
import type { SeatView } from '@/nights/nights';

export type SeatData = {
  playerId: string;
  playerName: string;
  colorSlot: number;
  buyInCents: number | null;
  cashOutCents: number | null;
  updatedAt: string | null;
};

export function toSeatData(seat: SeatView): SeatData {
  return {
    playerId: seat.playerId,
    playerName: seat.playerName,
    colorSlot: seat.playerColorSlot,
    buyInCents: seat.buyInCents,
    cashOutCents: seat.cashOutCents,
    updatedAt: seat.updatedAt.toISOString(),
  };
}

export function centsToInput(cents: number | null): string {
  if (cents === null) return '';
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export function stepAmount(text: string, deltaCents: number, floorCents: number): string {
  const parsed = parseDollars(text);
  if (parsed.kind === 'invalid') return text;
  const current = parsed.kind === 'amount' ? parsed.cents : 0;
  return centsToInput(Math.max(floorCents, current + deltaCents));
}

export function rebuyCount(buyInCents: number | null, stepCents: number | null): number | null {
  if (buyInCents === null || stepCents === null || stepCents <= 0) return null;
  if (buyInCents % stepCents !== 0) return null;
  return Math.max(0, buyInCents / stepCents - 1);
}

export function seatNetCents(seat: Pick<SeatData, 'buyInCents' | 'cashOutCents'>): number | null {
  if (seat.buyInCents === null || seat.cashOutCents === null) return null;
  return seat.cashOutCents - seat.buyInCents;
}
