type PayoutSeat = {
  playerId: string;
  playerName: string;
  playerColorSlot: number;
  cashOutCents: number | null;
  paidOutAt: Date | null;
};

export type Payout = {
  playerId: string;
  name: string;
  colorSlot: number;
  cents: number;
  paid: boolean;
};

export type PayoutPlan = {
  bank: { playerId: string; name: string; colorSlot: number; keepsCents: number };
  payouts: Payout[];
  owedCents: number;
  leftCents: number;
};

export function payoutPlan(seats: PayoutSeat[], bankPlayerId: string | null): PayoutPlan | null {
  const bank = seats.find((seat) => seat.playerId === bankPlayerId);
  if (!bank) return null;

  const payouts = seats
    .filter((seat) => seat.playerId !== bank.playerId && (seat.cashOutCents ?? 0) > 0)
    .map((seat) => ({
      playerId: seat.playerId,
      name: seat.playerName,
      colorSlot: seat.playerColorSlot,
      cents: seat.cashOutCents ?? 0,
      paid: seat.paidOutAt !== null,
    }))
    .sort(
      (a, b) =>
        Number(a.paid) - Number(b.paid) || b.cents - a.cents || a.name.localeCompare(b.name),
    );

  return {
    bank: {
      playerId: bank.playerId,
      name: bank.playerName,
      colorSlot: bank.playerColorSlot,
      keepsCents: bank.cashOutCents ?? 0,
    },
    payouts,
    owedCents: payouts.reduce((sum, payout) => sum + payout.cents, 0),
    leftCents: payouts.reduce((sum, payout) => sum + (payout.paid ? 0 : payout.cents), 0),
  };
}
