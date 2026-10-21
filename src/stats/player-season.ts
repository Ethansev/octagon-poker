import { nightWinners, seatNet, type ClosedNight } from '@/stats/nights';

export type PlayerSeason = {
  playerId: string;
  netCents: number;
  nightsPlayed: number;
  nightsWon: number;
  biggestNight: { nightId: string; date: string; netCents: number } | null;
  longestUpStreak: number;
  history: { nightId: string; date: string; netCents: number; won: boolean }[];
};

export function playerSeason(nights: ClosedNight[], playerId: string): PlayerSeason {
  const history: PlayerSeason['history'] = [];
  const ordered = [...nights].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  for (const night of ordered) {
    const seat = night.seats.find((s) => s.playerId === playerId);
    if (!seat) continue;
    history.push({
      nightId: night.id,
      date: night.date,
      netCents: seatNet(seat),
      won: nightWinners(night.seats).includes(playerId),
    });
  }

  let biggestNight: PlayerSeason['biggestNight'] = null;
  let longestUpStreak = 0;
  let streak = 0;
  for (const entry of history) {
    streak = entry.netCents > 0 ? streak + 1 : 0;
    longestUpStreak = Math.max(longestUpStreak, streak);
    if (entry.netCents > 0 && (biggestNight === null || entry.netCents > biggestNight.netCents)) {
      biggestNight = { nightId: entry.nightId, date: entry.date, netCents: entry.netCents };
    }
  }

  return {
    playerId,
    netCents: history.reduce((sum, entry) => sum + entry.netCents, 0),
    nightsPlayed: history.length,
    nightsWon: history.filter((entry) => entry.won).length,
    biggestNight,
    longestUpStreak,
    history,
  };
}
