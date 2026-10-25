import { seasonPlayers, type Identify, type SeasonPlayer } from '@/app/(group)/season-players';
import { nightPot, type ClosedNight } from '@/stats/nights';
import { recap } from '@/stats/recap';
import { currentUpStreak } from '@/stats/streaks';

export type RecapScope = { kind: 'current'; year: number } | { kind: 'past'; year: number };

export type RecapAwards = {
  mostNightsWon: { players: SeasonPlayer[]; count: number } | null;
  biggestNight: { player: SeasonPlayer; nightId: string; date: string; netCents: number } | null;
  longestUpStreak: { players: SeasonPlayer[]; count: number; live: boolean } | null;
};

export type RecapView = {
  scope: RecapScope;
  nightsPlayed: number;
  potCents: number;
  players: SeasonPlayer[];
  awards: RecapAwards;
};

export function recapView(nights: ClosedNight[], identify: Identify, scope: RecapScope): RecapView {
  const result = recap(nights);
  const players = seasonPlayers(result, identify);
  const pick = (ids: string[]) => players.filter((player) => ids.includes(player.playerId));
  const { mostNightsWon, biggestNight, longestUpStreak } = result;
  const biggestPlayer = biggestNight
    ? players.find((player) => player.playerId === biggestNight.playerId)
    : undefined;
  const streakers = longestUpStreak ? pick(longestUpStreak.playerIds) : [];

  return {
    scope,
    nightsPlayed: nights.length,
    potCents: nights.reduce((sum, night) => sum + nightPot(night.seats), 0),
    players,
    awards: {
      mostNightsWon: mostNightsWon
        ? { players: pick(mostNightsWon.playerIds), count: mostNightsWon.count }
        : null,
      biggestNight:
        biggestNight && biggestPlayer
          ? {
              player: biggestPlayer,
              nightId: biggestNight.nightId,
              date: biggestNight.date,
              netCents: biggestNight.netCents,
            }
          : null,
      longestUpStreak: longestUpStreak
        ? {
            players: streakers,
            count: longestUpStreak.count,
            live:
              scope.kind === 'current' &&
              longestUpStreak.count >= 2 &&
              streakers.some((player) => currentUpStreak(player.history) === longestUpStreak.count),
          }
        : null,
    },
  };
}
