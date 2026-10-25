import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecapEmpty({ year, latestYear }: { year: number; latestYear: number | null }) {
  return (
    <section
      aria-labelledby='recap-title'
      className='relative overflow-hidden rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-10 lg:p-14'>
      <span
        aria-hidden
        className='pointer-events-none absolute -right-6 -bottom-16 text-[220px] leading-none font-bold tracking-tighter text-current/[0.06] select-none sm:-bottom-24 sm:text-[360px]'>
        ’{String(year).slice(2)}
      </span>
      <p className='relative text-xs font-extrabold tracking-[0.14em] text-current/75 uppercase'>
        {year} Wrapped
      </p>
      <h1
        id='recap-title'
        className='relative mt-3 max-w-[16ch] text-4xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl'>
        Nothing on the books for {year}
      </h1>
      <p className='relative mt-4 max-w-[48ch] text-lg font-semibold text-hero-muted'>
        No nights were closed that year, so there’s nothing to unwrap. Yet.
      </p>
      {latestYear !== null && (
        <Link
          href={`/recap/${latestYear}`}
          className='relative mt-8 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none'>
          See {latestYear} Wrapped <ArrowRight aria-hidden className='size-4' />
        </Link>
      )}
    </section>
  );
}
