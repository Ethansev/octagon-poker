import type { PlayerSeason } from '@/stats/player-season';

export type Streak = { playerId: string; count: number };

export type Heater = Streak & { kind: 'live' | 'best' };

export function currentUpStreak(history: PlayerSeason['history']): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].netCents <= 0) break;
    streak++;
  }
  return streak;
}

function top(players: PlayerSeason[], count: (player: PlayerSeason) => number): Streak | null {
  const best = players
    .map((player) => ({ player, count: count(player) }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.player.netCents - a.player.netCents ||
        a.player.playerId.localeCompare(b.player.playerId),
    )[0];
  return best ? { playerId: best.player.playerId, count: best.count } : null;
}

export function liveStreak(players: PlayerSeason[]): Streak | null {
  const streak = top(players, (player) => currentUpStreak(player.history));
  return streak && streak.count >= 2 ? streak : null;
}

export function bestStreak(players: PlayerSeason[]): Streak | null {
  const streak = top(players, (player) => player.longestUpStreak);
  return streak && streak.count >= 1 ? streak : null;
}

export function hottestStreak(
  players: PlayerSeason[],
  scope: 'ongoing' | 'finished',
): Heater | null {
  const live = scope === 'ongoing' ? liveStreak(players) : null;
  if (live) return { ...live, kind: 'live' };
  const best = bestStreak(players);
  return best ? { ...best, kind: 'best' } : null;
}
