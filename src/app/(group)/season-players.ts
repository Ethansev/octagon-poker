import type { Player } from '@/players/players';
import type { PlayerSeason } from '@/stats/player-season';
import type { Recap } from '@/stats/recap';

export type SeasonPlayer = PlayerSeason & { name: string; colorSlot: number; rank: number | null };

export type Identify = (playerId: string) => { name: string; colorSlot: number };

export function identifyFrom(roster: Player[]): Identify {
  const byId = new Map(roster.map((player) => [player.id, player]));
  return (playerId) => {
    const player = byId.get(playerId);
    return { name: player?.name ?? 'Unknown', colorSlot: player?.colorSlot ?? 0 };
  };
}

export function seasonPlayers(awards: Recap, identify: Identify): SeasonPlayer[] {
  const rankOf = new Map(awards.standings.ranked.map((row, index) => [row.playerId, index + 1]));
  return awards.players.map((player) => ({
    ...player,
    ...identify(player.playerId),
    rank: rankOf.get(player.playerId) ?? null,
  }));
}
