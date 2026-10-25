import type { RecapView } from '@/app/(group)/recap/[year]/recap-view';
import { formatDollars } from '@/money/money';

function Figure({ value, label, accent }: { value: string; label: string; accent: boolean }) {
  return (
    <div className='flex flex-col-reverse'>
      <dt className='mt-2 text-sm font-bold text-current/75'>{label}</dt>
      <dd
        className={
          accent
            ? 'text-5xl leading-none font-bold tracking-tight text-hero-figure tabular-nums sm:text-7xl'
            : 'text-5xl leading-none font-bold tracking-tight tabular-nums sm:text-7xl'
        }>
        {value}
      </dd>
    </div>
  );
}

export function RecapHero({ view }: { view: RecapView }) {
  const { scope } = view;
  const players = view.players.length;

  return (
    <section
      aria-labelledby='recap-title'
      className='relative overflow-hidden rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-10 lg:p-14'>
      <span
        aria-hidden
        className='pointer-events-none absolute -right-6 -bottom-16 text-[220px] leading-none font-bold tracking-tighter text-current/[0.06] select-none sm:-bottom-24 sm:text-[360px] lg:text-[440px]'>
        ’{String(scope.year).slice(2)}
      </span>
      <p className='relative text-xs font-extrabold tracking-[0.14em] text-current/75 uppercase'>
        {scope.kind === 'current' ? `${scope.year} so far` : 'Your year in poker'}
      </p>
      <h1
        id='recap-title'
        className='relative mt-3 text-5xl leading-[0.95] font-bold tracking-tight sm:text-7xl lg:text-8xl'>
        {scope.year} Wrapped
      </h1>
      <p className='relative mt-4 max-w-[40ch] text-lg font-semibold text-hero-muted sm:text-xl'>
        {scope.kind === 'current'
          ? 'Hey crew, here’s the year so far. Still plenty of hands left to deal.'
          : `Hey crew, here’s how ${scope.year} went. Every night, every streak, every winner.`}
      </p>
      <dl className='relative mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 sm:flex sm:flex-wrap sm:gap-x-16'>
        <Figure
          value={String(view.nightsPlayed)}
          label={view.nightsPlayed === 1 ? 'night played' : 'nights played'}
          accent={false}
        />
        <Figure
          value={String(players)}
          label={players === 1 ? 'player sat down' : 'players sat down'}
          accent={false}
        />
        <div className='col-span-2 sm:col-span-1'>
          <Figure value={formatDollars(view.potCents)} label='crossed the table' accent />
        </div>
      </dl>
    </section>
  );
}
