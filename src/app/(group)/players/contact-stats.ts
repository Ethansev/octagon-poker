import type { ClosedNight } from '@/stats/nights';
import { playerSeason } from '@/stats/player-season';

export type ContactStats = {
  nightsPlayed: number;
  nightsWon: number;
  upNights: number;
  downNights: number;
  netCents: number;
};

export function contactStats(nights: ClosedNight[], playerId: string): ContactStats {
  const { nightsPlayed, nightsWon, netCents, history } = playerSeason(nights, playerId);
  return {
    nightsPlayed,
    nightsWon,
    netCents,
    upNights: history.filter((night) => night.netCents > 0).length,
    downNights: history.filter((night) => night.netCents < 0).length,
  };
}
