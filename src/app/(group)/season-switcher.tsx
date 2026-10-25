import type { Season } from '@/stats/season';
import Link from 'next/link';

function pillClass(active: boolean): string {
  return `rounded-full border px-3 py-1 text-xs ${
    active
      ? 'border-ink bg-ink text-bg'
      : 'border-line text-ink-2 hover:border-ink-3 hover:text-ink'
  }`;
}

export function SeasonSwitcher({ seasons, current }: { seasons: number[]; current: Season }) {
  return (
    <nav aria-label='Season' className='-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1'>
      {seasons.map((year) => (
        <Link
          key={year}
          href={`?season=${year}`}
          aria-current={current === year ? 'page' : undefined}
          className={pillClass(current === year)}>
          {year}
        </Link>
      ))}
      <Link
        href='?season=all'
        aria-current={current === 'all' ? 'page' : undefined}
        className={pillClass(current === 'all')}>
        All time
      </Link>
    </nav>
  );
}
