import { currentYearInGroup } from '@/dates/group-time';
import { listNights } from '@/nights/nights';
import { parseSeason, type Season } from '@/stats/season';

export type SeasonChoice = { season: Season; seasons: number[] };

export async function resolveSeason(
  groupId: string,
  rawSeason: string | string[] | undefined,
): Promise<SeasonChoice> {
  const currentYear = currentYearInGroup();
  const season = parseSeason(typeof rawSeason === 'string' ? rawSeason : undefined, currentYear);
  const all = await listNights(groupId, 'all');
  const years = new Set([currentYear, ...all.map((night) => Number(night.date.slice(0, 4)))]);
  return { season, seasons: [...years].sort((a, b) => b - a) };
}

export function seasonLabel(season: Season): string {
  return season === 'all' ? 'all time' : String(season);
}
