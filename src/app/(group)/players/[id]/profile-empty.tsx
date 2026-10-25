import type { PlayerProfile } from '@/app/(group)/players/[id]/load-player';
import { firstName } from '@/players/first-name';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ProfileEmpty({ profile }: { profile: PlayerProfile }) {
  const { scope } = profile;
  const name = firstName(profile.player.name);
  const headline =
    scope.kind === 'all'
      ? `${name} hasn’t sat down yet`
      : scope.kind === 'current'
        ? `${name} hasn’t sat down in ${scope.year} yet`
        : `${name} sat out ${scope.year}`;

  return (
    <section
      aria-labelledby='empty-heading'
      className='flex h-full flex-col justify-center rounded-panel border border-dashed border-line bg-surface-2 p-6 sm:p-10'>
      <h2
        id='empty-heading'
        className='max-w-[22ch] text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl'>
        {headline}
      </h2>
      <p className='mt-3 max-w-[48ch] font-semibold text-ink-2'>
        No nights played in this season. The chart, streaks and night-by-night history show up once
        they’re in the books.
      </p>
      {scope.kind !== 'all' && (
        <Link
          href='?season=all'
          className='mt-6 inline-flex h-11 w-fit cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none'>
          See all time <ArrowRight aria-hidden className='size-4' />
        </Link>
      )}
    </section>
  );
}
