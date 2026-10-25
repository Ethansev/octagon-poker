import type { Viewer } from '@/access/viewer';
import { OctagonMark } from '@/components/octagon-mark';
import { currentYearInGroup } from '@/dates/group-time';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/theme/theme-toggle';
import { Gift, LogIn, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

const quietLink =
  'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold text-ink-2 transition hover:bg-surface hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none';

function AccountLink({ viewer }: { viewer: Viewer }) {
  if (viewer.role === 'owner') {
    return (
      <Link
        href='/settings'
        aria-label='Settings'
        className={cn(quietLink, 'w-10 lg:w-auto lg:px-4')}>
        <Settings aria-hidden className='size-[18px]' />
        <span className='hidden lg:inline'>Settings</span>
      </Link>
    );
  }
  return (
    <Link href='/sign-in' aria-label='Sign in' className={cn(quietLink, 'w-10 lg:w-auto lg:px-4')}>
      <LogIn aria-hidden className='size-[18px]' />
      <span className='hidden lg:inline'>Sign in</span>
    </Link>
  );
}

export function SiteHeader({ viewer }: { viewer: Viewer }) {
  const year = currentYearInGroup();

  return (
    <header className='sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl'>
      <div className='mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-10'>
        <Link
          href='/'
          className='group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition hover:bg-surface/80 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
          <OctagonMark className='transition group-hover:rotate-[22.5deg] motion-reduce:transition-none' />
          <span className='truncate text-lg font-bold tracking-tight sm:text-xl'>
            {viewer.group.name}
          </span>
        </Link>
        <nav aria-label='Main' className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
          <Link href={`/recap/${year}`} className={cn(quietLink, 'hidden px-4 sm:inline-flex')}>
            <Gift aria-hidden className='size-4' />
            {year} Wrapped
          </Link>
          <ThemeToggle />
          <AccountLink viewer={viewer} />
          <Link
            href='/nights/new'
            className='inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-extrabold whitespace-nowrap text-primary-ink transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none active:translate-y-0 motion-reduce:transition-none'>
            <Plus aria-hidden className='hidden size-4 sm:block' strokeWidth={3} />
            Log a night
          </Link>
        </nav>
      </div>
    </header>
  );
}
