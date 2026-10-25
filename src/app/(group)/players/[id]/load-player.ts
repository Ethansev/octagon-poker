import { identifyFrom, seasonPlayers, type SeasonPlayer } from '@/app/(group)/season-players';
import { resolveSeason, seasonScope, type SeasonScope } from '@/app/(group)/seasons';
import { currentYearInGroup } from '@/dates/group-time';
import { listClosedNights, listNights } from '@/nights/nights';
import { listPlayers, type Player } from '@/players/players';
import { playerSeason, winRate } from '@/stats/player-season';
import { recap } from '@/stats/recap';
import { nightsInSeason, type Season } from '@/stats/season';
import { currentUpStreak } from '@/stats/streaks';
import { vibe, type Vibe } from '@/stats/vibe';

export type ProfileNight = {
  nightId: string;
  date: string;
  location: string | null;
  netCents: number;
  won: boolean;
};

export type PlayerProfile = {
  player: Player;
  season: Season;
  seasons: number[];
  scope: SeasonScope;
  stats: SeasonPlayer;
  vibe: Vibe;
  winRate: number | null;
  currentStreak: number;
  rankedCount: number;
  nights: ProfileNight[];
};

export async function loadPlayer(
  groupId: string,
  player: Player,
  rawSeason: string | string[] | undefined,
): Promise<PlayerProfile> {
  const { season, seasons } = await resolveSeason(groupId, rawSeason);
  const [allClosed, summaries, roster] = await Promise.all([
    listClosedNights(groupId),
    listNights(groupId, season),
    listPlayers(groupId),
  ]);
  const closed = nightsInSeason(allClosed, season);
  const awards = recap(closed);
  const stats = seasonPlayers(awards, identifyFrom(roster)).find(
    (row) => row.playerId === player.id,
  ) ?? {
    ...playerSeason(closed, player.id),
    name: player.name,
    colorSlot: player.colorSlot,
    rank: null,
  };
  const locations = new Map(summaries.map((night) => [night.id, night.location]));

  return {
    player,
    season,
    seasons,
    scope: seasonScope(season, currentYearInGroup()),
    stats,
    vibe: vibe(stats, stats.rank),
    winRate: winRate(stats),
    currentStreak: currentUpStreak(stats.history),
    rankedCount: awards.standings.ranked.length,
    nights: stats.history.map((entry) => ({
      ...entry,
      location: locations.get(entry.nightId) ?? null,
    })),
  };
}
