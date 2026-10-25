import { SegmentedNav } from '@/app/(group)/segmented-nav';
import type { Season } from '@/stats/season';

export function SeasonSwitcher({ seasons, current }: { seasons: number[]; current: Season }) {
  return (
    <SegmentedNav
      label='Season'
      items={[
        ...seasons.map((year) => ({
          href: `?season=${year}`,
          label: String(year),
          active: current === year,
        })),
        { href: '?season=all', label: 'All time', active: current === 'all' },
      ]}
    />
  );
}
