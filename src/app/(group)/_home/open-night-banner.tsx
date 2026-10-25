import { LiveDot } from '@/app/(group)/_home/live-dot';
import { formatNightDate } from '@/nights/dates';
import type { NightSummary } from '@/nights/nights';
import { ArrowRight, Spade } from 'lucide-react';
import Link from 'next/link';

export function OpenNightBanner({ night }: { night: NightSummary }) {
  return (
    <Link
      href={`/nights/${night.id}`}
      className='group flex cursor-pointer flex-col gap-4 rounded-panel bg-surface p-5 text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:flex-row sm:items-center sm:p-6'>
      <div className='flex flex-1 items-start gap-4 sm:items-center'>
        <span
          aria-hidden
          className='grid size-12 shrink-0 place-items-center rounded-2xl bg-live-soft text-live sm:size-14'>
          <Spade className='size-6 sm:size-7' fill='currentColor' strokeWidth={1.5} />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-live uppercase'>
            <LiveDot />
            Game on · {formatNightDate(night.date)}
          </p>
          <p className='mt-1 text-2xl leading-tight font-bold tracking-tight sm:text-3xl'>
            {night.location ? `${night.location} is dealing` : 'A night is still open'}
          </p>
          <p className='mt-1 text-sm font-semibold text-ink-2'>
            Done playing? Drop your cash-out so the books can close.
          </p>
        </div>
      </div>
      <span className='inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition group-hover:gap-3 group-hover:bg-primary-hover motion-reduce:transition-none'>
        Enter my cash-out <ArrowRight aria-hidden className='size-4' />
      </span>
    </Link>
  );
}
