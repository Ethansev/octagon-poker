import type { SeatView } from '@/nights/nights';

export type SeatData = {
  playerId: string;
  playerName: string;
  buyInCents: number | null;
  cashOutCents: number | null;
  updatedAt: string | null;
};

export function toSeatData(seat: SeatView): SeatData {
  return {
    playerId: seat.playerId,
    playerName: seat.playerName,
    buyInCents: seat.buyInCents,
    cashOutCents: seat.cashOutCents,
    updatedAt: seat.updatedAt.toISOString(),
  };
}

export function centsToInput(cents: number | null): string {
  if (cents === null) return '';
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}
