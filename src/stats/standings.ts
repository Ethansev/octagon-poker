import { nightWinners, seatNet, type ClosedNight } from '@/stats/nights';

export type Standing = { playerId: string; netCents: number; nightsPlayed: number; nightsWon: number };

const byId = (a: Standing, b: Standing) => a.playerId.localeCompare(b.playerId);

export function standings(nights: ClosedNight[]): { ranked: Standing[]; unranked: Standing[] } {
  const totals = new Map<string, Standing>();
  for (const night of nights) {
    const winners = new Set(nightWinners(night.seats));
    for (const seat of night.seats) {
      const current = totals.get(seat.playerId) ?? {
        playerId: seat.playerId,
        netCents: 0,
        nightsPlayed: 0,
        nightsWon: 0,
      };
      totals.set(seat.playerId, {
        playerId: seat.playerId,
        netCents: current.netCents + seatNet(seat),
        nightsPlayed: current.nightsPlayed + 1,
        nightsWon: current.nightsWon + (winners.has(seat.playerId) ? 1 : 0),
      });
    }
  }
  const all = [...totals.values()];
  const ranked = all
    .filter((s) => s.netCents > 0)
    .sort((a, b) => b.netCents - a.netCents || b.nightsWon - a.nightsWon || a.nightsPlayed - b.nightsPlayed || byId(a, b));
  const unranked = all.filter((s) => s.netCents <= 0).sort((a, b) => b.netCents - a.netCents || byId(a, b));
  return { ranked, unranked };
}
