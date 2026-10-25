import type { HomeView } from '@/app/(group)/_home/load-home';
import { OctagonMark } from '@/components/octagon-mark';
import { ArrowRight, Gift, Plus } from 'lucide-react';
import Link from 'next/link';

type EmptyReason =
  { kind: 'open-only' } | { kind: 'quiet-season'; year: number } | { kind: 'no-nights' };

function emptyReason(home: HomeView): EmptyReason {
  if (home.openNight) return { kind: 'open-only' };
  if (home.scope.kind === 'past') return { kind: 'quiet-season', year: home.scope.year };
  return { kind: 'no-nights' };
}

function copy(reason: EmptyReason, home: HomeView): { headline: string; body: string } {
  switch (reason.kind) {
    case 'open-only':
      return {
        headline: 'First night’s still in play',
        body: 'Standings, streaks and the crew land here as soon as it closes.',
      };
    case 'quiet-season':
      return {
        headline: `Nothing on the books for ${reason.year}`,
        body: 'No nights were closed that season.',
      };
    case 'no-nights':
      return home.scope.kind === 'current'
        ? {
            headline: 'Fresh season. Deal one in!',
            body: `Nothing’s been logged in ${home.scope.year} yet. Log the first night and this page fills up with winners, streaks and the crew.`,
          }
        : {
            headline: 'No nights yet. Deal one in!',
            body: 'Log the first night and this page fills up with winners, streaks and the crew.',
          };
  }
}

const pill =
  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none';

export function SeasonEmpty({ home }: { home: HomeView }) {
  const reason = emptyReason(home);
  const { headline, body } = copy(reason, home);

  return (
    <section
      aria-labelledby='empty-heading'
      className='relative overflow-hidden rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-10 lg:p-14'>
      <OctagonMark className='pointer-events-none absolute -right-16 -bottom-20 hidden size-72 bg-hero-ink text-[160px] text-hero opacity-[0.06] sm:grid sm:size-96 sm:text-[220px]' />
      <h2
        id='empty-heading'
        className='relative max-w-[18ch] text-4xl leading-[1.02] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
        {headline}
      </h2>
      <p className='relative mt-4 max-w-[52ch] text-base font-semibold text-hero-muted sm:text-lg'>
        {body}
      </p>
      <div className='relative mt-8 flex flex-wrap gap-3'>
        {reason.kind === 'no-nights' && (
          <Link
            href='/nights/new'
            className={`${pill} bg-primary text-primary-ink hover:-translate-y-0.5 hover:bg-primary-hover`}>
            <Plus aria-hidden className='size-4' strokeWidth={3} />
            Log the first night
          </Link>
        )}
        {reason.kind === 'quiet-season' && (
          <Link
            href='/'
            className={`${pill} bg-primary text-primary-ink hover:-translate-y-0.5 hover:bg-primary-hover`}>
            Back to this season
            <ArrowRight aria-hidden className='size-4' />
          </Link>
        )}
        {home.previousRecapYear !== null && (
          <Link
            href={`/recap/${home.previousRecapYear}`}
            className={`${pill} bg-hero-chip-muted text-hero-ink ring-1 ring-current/20 hover:ring-current/50`}>
            <Gift aria-hidden className='size-4' />
            See the {home.previousRecapYear} recap
          </Link>
        )}
      </div>
    </section>
  );
}
