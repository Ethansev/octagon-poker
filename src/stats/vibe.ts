import type { PlayerSeason } from '@/stats/player-season';
import { currentUpStreak } from '@/stats/streaks';

export type Vibe =
  | { kind: 'leader' }
  | { kind: 'streak'; count: number }
  | { kind: 'night-winner'; count: number }
  | { kind: 'in-the-green' }
  | { kind: 'even' }
  | { kind: 'comeback' };

export function vibe(player: PlayerSeason, rank: number | null): Vibe {
  if (rank === 1) return { kind: 'leader' };
  const streak = currentUpStreak(player.history);
  if (streak >= 2) return { kind: 'streak', count: streak };
  if (player.nightsWon >= 2) return { kind: 'night-winner', count: player.nightsWon };
  if (player.netCents > 0) return { kind: 'in-the-green' };
  if (player.netCents === 0) return { kind: 'even' };
  return { kind: 'comeback' };
}
