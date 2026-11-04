import { formatNightDate, formatNightTime } from '@/nights/dates';
import type { NightSummary } from '@/nights/nights';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export function NextNightBanner({ night }: { night: NightSummary }) {
  return (
    <Link
      href={`/nights/${night.id}`}
      className='group flex cursor-pointer flex-col gap-4 rounded-panel bg-surface p-5 text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:flex-row sm:items-center sm:p-6'>
      <div className='flex flex-1 items-start gap-4 sm:items-center'>
        <span
          aria-hidden
          className='grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-3 text-ink sm:size-14'>
          <CalendarDays className='size-6 sm:size-7' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase'>
            Next game · {formatNightDate(night.date)}
            {night.startTime !== null && ` · ${formatNightTime(night.startTime)}`}
          </p>
          <p className='mt-1 text-2xl leading-tight font-bold tracking-tight break-words sm:text-3xl'>
            {night.location ?? 'Poker night'}
          </p>
        </div>
      </div>
      <span className='inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition group-hover:gap-3 group-hover:bg-primary-hover motion-reduce:transition-none'>
        See the night <ArrowRight aria-hidden className='size-4' />
      </span>
    </Link>
  );
}
