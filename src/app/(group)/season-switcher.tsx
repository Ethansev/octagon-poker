import { cn } from '@/lib/utils';
import type { Season } from '@/stats/season';
import Link from 'next/link';

function SeasonLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full px-4 text-sm font-bold whitespace-nowrap tabular-nums transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none focus-visible:ring-inset',
        active ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
      )}>
      {children}
    </Link>
  );
}

export function SeasonSwitcher({ seasons, current }: { seasons: number[]; current: Season }) {
  return (
    <nav
      aria-label='Season'
      className='-mx-4 [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden'>
      <div className='inline-flex gap-1 rounded-full bg-surface p-1 shadow-card'>
        {seasons.map((year) => (
          <SeasonLink key={year} href={`?season=${year}`} active={current === year}>
            {year}
          </SeasonLink>
        ))}
        <SeasonLink href='?season=all' active={current === 'all'}>
          All time
        </SeasonLink>
      </div>
    </nav>
  );
}
