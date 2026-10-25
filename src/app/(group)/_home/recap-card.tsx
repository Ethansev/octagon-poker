import type { HomeHighlights } from '@/app/(group)/_home/load-home';
import { joinNames } from '@/nights/names';
import { firstName } from '@/players/first-name';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecapCard({
  year,
  mostNightsWon,
}: {
  year: number;
  mostNightsWon: HomeHighlights['mostNightsWon'];
}) {
  return (
    <Link
      href={`/recap/${year}`}
      className='group relative flex h-full min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-panel bg-recap p-6 text-recap-ink shadow-story transition hover:-translate-y-1 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:p-7'>
      <span
        aria-hidden
        className='absolute -right-4 -bottom-12 text-[200px] leading-none font-bold tracking-tight text-current/10 select-none'>
        ’{String(year).slice(2)}
      </span>
      <p className='text-xs font-extrabold tracking-[0.14em] text-current/70 uppercase'>
        Your year in poker
      </p>
      <p className='relative mt-2 text-4xl leading-none font-bold tracking-tight'>{year} Wrapped</p>
      <p className='relative mt-2 max-w-[30ch] text-sm font-semibold text-current/75'>
        Awards, streaks, and the night everyone still talks about.
      </p>
      {mostNightsWon && (
        <div className='relative mt-6 mb-6 rounded-3xl bg-recap-panel p-4'>
          <p className='text-xs font-extrabold tracking-[0.12em] text-current/65 uppercase'>
            Sneak peek · most nights won
          </p>
          <p className='mt-1 text-2xl font-bold tracking-tight'>
            {joinNames(mostNightsWon.players.map((player) => firstName(player.name)))}{' '}
            <span className='tabular-nums'>×{mostNightsWon.count}</span>
            <span aria-hidden> 🏆</span>
          </p>
        </div>
      )}
      <span className='relative mt-auto inline-flex h-11 w-fit items-center gap-2 rounded-full bg-recap-cta px-5 text-sm font-extrabold text-recap-cta-ink transition group-hover:gap-3 motion-reduce:transition-none'>
        Unwrap it <ArrowRight aria-hidden className='size-4' />
      </span>
    </Link>
  );
}
