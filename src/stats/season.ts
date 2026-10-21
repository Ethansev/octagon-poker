import type { ClosedNight } from '@/stats/nights';

export type Season = number | 'all';

export function nightsInSeason(nights: ClosedNight[], season: Season): ClosedNight[] {
  if (season === 'all') return nights;
  const prefix = `${season}-`;
  return nights.filter((night) => night.date.startsWith(prefix));
}

export function parseSeason(value: string | undefined, currentYear: number): Season {
  if (value === 'all') return 'all';
  if (value !== undefined && /^\d{4}$/.test(value)) return Number(value);
  return currentYear;
}
