export type SeatResult = { playerId: string; buyInCents: number; cashOutCents: number };
export type ClosedNight = { id: string; date: string; seats: SeatResult[] };

export type NightBalance =
  | { kind: 'balanced'; totalCents: number }
  | { kind: 'missing-cash-out'; playerIds: string[] }
  | { kind: 'off'; inCents: number; outCents: number }
  | { kind: 'empty' };

export function seatNet(seat: SeatResult): number {
  return seat.cashOutCents - seat.buyInCents;
}

export function nightPot(seats: SeatResult[]): number {
  return seats.reduce((sum, seat) => sum + seat.buyInCents, 0);
}

export function nightWinners(seats: SeatResult[]): string[] {
  const top = Math.max(0, ...seats.map(seatNet));
  if (top <= 0) return [];
  return seats.filter((seat) => seatNet(seat) === top).map((seat) => seat.playerId);
}

export function nightBalance(
  seats: { playerId: string; buyInCents: number; cashOutCents: number | null }[],
): NightBalance {
  if (seats.length === 0) return { kind: 'empty' };
  const missing = seats.filter((seat) => seat.cashOutCents === null).map((seat) => seat.playerId);
  if (missing.length > 0) return { kind: 'missing-cash-out', playerIds: missing };
  const inCents = seats.reduce((sum, seat) => sum + seat.buyInCents, 0);
  const outCents = seats.reduce((sum, seat) => sum + (seat.cashOutCents ?? 0), 0);
  if (inCents !== outCents) return { kind: 'off', inCents, outCents };
  return { kind: 'balanced', totalCents: inCents };
}
