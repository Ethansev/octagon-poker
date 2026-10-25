import type { NightSummary } from '@/nights/nights';

export type NightPicks = { locations: string[]; buyIns: number[] };

export type NightHints = {
  open: NightSummary | null;
  last: NightSummary | null;
  picks: NightPicks;
};

export const QUICK_BUY_INS = [2000, 5000, 10000, 20000];

const MAX_LOCATIONS = 5;
const MAX_EXTRA_BUY_INS = 2;

type Tally<T> = { value: T; count: number; firstSeen: number };

function tally<T>(values: T[], keyOf: (value: T) => string): Tally<T>[] {
  const byKey = new Map<string, Tally<T>>();
  values.forEach((value, index) => {
    const key = keyOf(value);
    const seen = byKey.get(key);
    if (seen) seen.count += 1;
    else byKey.set(key, { value, count: 1, firstSeen: index });
  });
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.firstSeen - b.firstSeen);
}

function locationPicks(nights: NightSummary[]): string[] {
  const locations = nights.flatMap((night) => {
    const location = night.location?.trim() ?? '';
    return location === '' ? [] : [location];
  });
  return tally(locations, (location) => location.toLocaleLowerCase())
    .slice(0, MAX_LOCATIONS)
    .map((entry) => entry.value);
}

function buyInPicks(nights: NightSummary[]): number[] {
  const used = nights.flatMap((night) => (night.buyInCents === null ? [] : [night.buyInCents]));
  const extras = tally(
    used.filter((cents) => !QUICK_BUY_INS.includes(cents)),
    String,
  )
    .slice(0, MAX_EXTRA_BUY_INS)
    .map((entry) => entry.value);
  return [...QUICK_BUY_INS, ...extras].sort((a, b) => a - b);
}

export function nightHints(newestFirst: NightSummary[]): NightHints {
  return {
    open: newestFirst.find((night) => night.status === 'open') ?? null,
    last: newestFirst.find((night) => night.status === 'closed') ?? null,
    picks: { locations: locationPicks(newestFirst), buyIns: buyInPicks(newestFirst) },
  };
}
