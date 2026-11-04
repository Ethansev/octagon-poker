import type { Player } from '@/players/players';

export function quickAddOrder(available: Player[], recentPlayerIds: string[]): Player[] {
  const rank = new Map(recentPlayerIds.map((id, index) => [id, index]));
  const rankOf = (player: Player) => rank.get(player.id) ?? recentPlayerIds.length;
  return [...available].sort((a, b) => rankOf(a) - rankOf(b) || a.name.localeCompare(b.name));
}
