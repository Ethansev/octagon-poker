import { cn } from '@/lib/utils';
import Link from 'next/link';

export type SegmentedNavItem = { href: string; label: string; active: boolean };

export function SegmentedNav({ label, items }: { label: string; items: SegmentedNavItem[] }) {
  return (
    <nav
      aria-label={label}
      className='-mx-4 [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden'>
      <div className='inline-flex gap-1 rounded-full bg-surface p-1 shadow-card'>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full px-4 text-sm font-bold whitespace-nowrap tabular-nums transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none focus-visible:ring-inset',
              item.active ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
            )}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
