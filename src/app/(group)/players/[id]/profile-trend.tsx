import type { PlayerProfile } from '@/app/(group)/players/[id]/load-player';
import { seasonSpan } from '@/app/(group)/season-copy';
import { TrendChart } from '@/charts/trend-chart';
import { firstName } from '@/players/first-name';
import { playerColor } from '@/players/player-color';

function trendLine(profile: PlayerProfile): string {
  const name = firstName(profile.player.name);
  const span = seasonSpan(profile.scope);
  if (profile.stats.netCents > 0) return `Every night ${name} sat down ${span}, stacked up.`;
  if (profile.stats.netCents === 0)
    return `${name} has broken even ${span}. Every night, stacked up.`;
  return `The road back to zero starts here. Every night ${span}, stacked up.`;
}

export function ProfileTrend({ profile }: { profile: PlayerProfile }) {
  const color = playerColor(profile.player.colorSlot);
  const up = profile.stats.netCents > 0;

  return (
    <section
      aria-labelledby='trend-heading'
      className='flex h-full flex-col rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='trend-heading' className='text-3xl font-bold tracking-tight'>
        Running total
      </h2>
      <p className='mt-1 text-sm font-semibold text-ink-2'>{trendLine(profile)}</p>
      <TrendChart
        nights={profile.nights}
        stroke={up ? color.solid : 'var(--loss)'}
        fill={up ? color.soft : 'var(--surface-2)'}
        className='mt-6 h-64 sm:h-72 lg:h-auto lg:min-h-72 lg:flex-1'
      />
    </section>
  );
}
