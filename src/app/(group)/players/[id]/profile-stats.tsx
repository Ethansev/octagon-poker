import type { PlayerProfile } from '@/app/(group)/players/[id]/load-player';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { formatShortNightDate } from '@/nights/dates';

type Tile = {
  key: string;
  label: string;
  value: string;
  mark: string | null;
  note: string;
  tone: 'win' | 'plain';
};

function streakTile(profile: PlayerProfile): Tile {
  const count = profile.currentStreak;
  const finished = profile.scope.kind === 'past';
  const live = !finished && count >= 2;
  return {
    key: 'current',
    label: finished ? 'Closing streak' : 'Current streak',
    value: String(count),
    mark: live ? '🔥' : null,
    note:
      count === 0
        ? finished
          ? 'Ended the year down'
          : 'Next night’s the one'
        : `${count === 1 ? 'night' : 'nights'} up${finished ? ' to finish' : ' and counting'}`,
    tone: 'plain',
  };
}

function tiles(profile: PlayerProfile): Tile[] {
  const { stats, winRate } = profile;
  const biggest = stats.biggestNight;
  return [
    {
      key: 'nights',
      label: 'Nights',
      value: String(stats.nightsPlayed),
      mark: null,
      note: 'at the table',
      tone: 'plain',
    },
    {
      key: 'wins',
      label: 'Wins',
      value: String(stats.nightsWon),
      mark: stats.nightsWon > 0 ? '🏆' : null,
      note: stats.nightsWon === 1 ? 'night on top' : 'nights on top',
      tone: 'plain',
    },
    {
      key: 'rate',
      label: 'Win rate',
      value: winRate === null ? '—' : `${Math.round(winRate * 100)}%`,
      mark: null,
      note: 'of nights won',
      tone: 'plain',
    },
    {
      key: 'biggest',
      label: 'Biggest night',
      value: biggest ? formatNet(biggest.netCents) : '—',
      mark: null,
      note: biggest ? formatShortNightDate(biggest.date) : 'No up nights yet',
      tone: biggest ? 'win' : 'plain',
    },
    {
      key: 'longest',
      label: 'Longest streak',
      value: String(stats.longestUpStreak),
      mark: null,
      note: `${stats.longestUpStreak === 1 ? 'night' : 'nights'} up in a row`,
      tone: 'plain',
    },
    streakTile(profile),
  ];
}

export function ProfileStats({ profile }: { profile: PlayerProfile }) {
  return (
    <section aria-label='Season stats'>
      <dl className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4'>
        {tiles(profile).map((tile) => (
          <div
            key={tile.key}
            className='flex flex-col rounded-card bg-surface p-5 shadow-card sm:p-6'>
            <dt className='text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase'>
              {tile.label}
            </dt>
            <dd className='mt-3 flex items-baseline gap-2'>
              <span
                className={cn(
                  'text-4xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums',
                  tile.tone === 'win' ? 'text-win' : 'text-ink',
                )}>
                {tile.value}
              </span>
              {tile.mark && (
                <span aria-hidden className='text-2xl'>
                  {tile.mark}
                </span>
              )}
            </dd>
            <dd className='mt-2 text-sm font-semibold text-ink-2'>{tile.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
