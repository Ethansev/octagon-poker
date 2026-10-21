import type { ClosedNight } from '@/stats/nights';
import { playerSeason, type PlayerSeason } from '@/stats/player-season';
import { standings } from '@/stats/standings';

export type Recap = {
  standings: ReturnType<typeof standings>;
  mostNightsWon: { playerIds: string[]; count: number } | null;
  biggestNight: { playerId: string; nightId: string; date: string; netCents: number } | null;
  longestUpStreak: { playerIds: string[]; count: number } | null;
  players: PlayerSeason[];
};

function topBy(players: PlayerSeason[], score: (p: PlayerSeason) => number) {
  const count = Math.max(0, ...players.map(score));
  if (count <= 0) return null;
  return { playerIds: players.filter((p) => score(p) === count).map((p) => p.playerId), count };
}

export function recap(nights: ClosedNight[]): Recap {
  const table = standings(nights);
  const players = [...table.ranked, ...table.unranked]
    .map((s) => playerSeason(nights, s.playerId))
    .sort((a, b) => b.netCents - a.netCents || a.playerId.localeCompare(b.playerId));

  let biggestNight: Recap['biggestNight'] = null;
  for (const player of players) {
    const night = player.biggestNight;
    if (!night) continue;
    const better =
      biggestNight === null ||
      night.netCents > biggestNight.netCents ||
      (night.netCents === biggestNight.netCents && night.date < biggestNight.date);
    if (better) biggestNight = { playerId: player.playerId, ...night };
  }

  return {
    standings: table,
    mostNightsWon: topBy(players, (p) => p.nightsWon),
    biggestNight,
    longestUpStreak: topBy(players, (p) => p.longestUpStreak),
    players,
  };
}
