import { formatDollars } from '@/money/money';
import { joinNames } from '@/nights/names';
import type { NightBalance } from '@/stats/nights';
import { nightBalance } from '@/stats/nights';

type CountedSeat = {
  playerId: string;
  playerName: string;
  buyInCents: number;
  cashOutCents: number | null;
};

function namesOf(ids: string[], seats: CountedSeat[]): string {
  return joinNames(
    ids.map((id) => seats.find((seat) => seat.playerId === id)?.playerName ?? 'Someone'),
  );
}

export function balanceNote(balance: NightBalance, seats: CountedSeat[]): string {
  switch (balance.kind) {
    case 'empty':
      return 'No players yet';
    case 'missing-cash-out':
      return `Waiting on ${namesOf(balance.playerIds, seats)}`;
    case 'off':
      return balance.outCents > balance.inCents
        ? `Cash-outs are ${formatDollars(balance.outCents - balance.inCents)} over buy-ins`
        : `Cash-outs are ${formatDollars(balance.inCents - balance.outCents)} short of buy-ins`;
    case 'balanced':
      return 'All counted';
  }
}

export function closeBlockedReason(seats: CountedSeat[]): string | null {
  const balance = nightBalance(seats);
  if (balance.kind === 'balanced') return null;
  if (balance.kind === 'empty') return 'Add players before closing the night.';
  if (balance.kind === 'missing-cash-out') {
    return `Can't close yet: waiting on a cash-out from ${namesOf(balance.playerIds, seats)}.`;
  }
  return `Can't close yet: ${balanceNote(balance, seats).toLowerCase()}.`;
}
