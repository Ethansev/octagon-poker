import { currentYearInGroup } from '@/dates/group-time';
import { listNights } from '@/nights/nights';
import { parseSeason, yearsWithNights, type Season } from '@/stats/season';

export type SeasonScope =
  { kind: 'current'; year: number } | { kind: 'past'; year: number } | { kind: 'all' };

export function seasonScope(season: Season, currentYear: number): SeasonScope {
  if (season === 'all') return { kind: 'all' };
  return season === currentYear
    ? { kind: 'current', year: season }
    : { kind: 'past', year: season };
}

export type SeasonChoice = { season: Season; seasons: number[] };

export async function resolveSeason(
  groupId: string,
  rawSeason: string | string[] | undefined,
): Promise<SeasonChoice> {
  const currentYear = currentYearInGroup();
  const season = parseSeason(typeof rawSeason === 'string' ? rawSeason : undefined, currentYear);
  const all = await listNights(groupId, 'all');
  return { season, seasons: yearsWithNights(all, currentYear) };
}

export function seasonLabel(season: Season): string {
  return season === 'all' ? 'all time' : String(season);
}
