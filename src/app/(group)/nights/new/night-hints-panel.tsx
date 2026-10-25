import { LiveDot } from '@/components/live-dot';
import { formatDollars } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import type { NightHints } from '@/nights/night-hints';
import type { NightSummary } from '@/nights/nights';
import { firstName } from '@/players/first-name';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const kicker = 'text-xs font-extrabold tracking-[0.14em] uppercase';

function OpenNightNote({ night }: { night: NightSummary }) {
  return (
    <Link
      href={`/nights/${night.id}`}
      className='group flex cursor-pointer items-center gap-4 rounded-card bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:p-6'>
      <div className='min-w-0 flex-1'>
        <p className={`inline-flex items-center gap-2 text-live ${kicker}`}>
          <LiveDot />
          Still live · {formatNightDate(night.date)}
        </p>
        <p className='mt-1.5 text-lg leading-snug font-bold tracking-tight'>
          {night.location ? `${night.location} hasn’t closed yet` : 'A night hasn’t closed yet'}
        </p>
        <p className='mt-0.5 text-sm font-semibold text-ink-2'>
          Logging seats for that one? Head there instead.
        </p>
      </div>
      <ArrowRight
        aria-hidden
        className='size-5 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none'
      />
    </Link>
  );
}

function LastTimeCard({ night }: { night: NightSummary }) {
  return (
    <section
      aria-labelledby='last-time-heading'
      className='rounded-panel bg-story-2 p-6 text-story-2-ink shadow-story sm:p-7'>
      <p id='last-time-heading' className={`text-current/75 ${kicker}`}>
        Last time · {formatNightDate(night.date)}
      </p>
      <p className='mt-3 text-3xl leading-tight font-bold tracking-tight break-words sm:text-4xl'>
        {night.location ?? 'Poker night'}
      </p>
      <dl className='mt-5 grid grid-cols-2 gap-4'>
        <div>
          <dt className='text-sm font-semibold text-current/70'>Buy-in</dt>
          <dd className='mt-0.5 text-2xl font-bold text-story-2-figure tabular-nums'>
            {night.buyInCents === null ? '—' : formatDollars(night.buyInCents)}
          </dd>
        </div>
        <div>
          <dt className='text-sm font-semibold text-current/70'>Took it</dt>
          <dd className='mt-0.5 truncate text-2xl font-bold'>
            {night.winnerNames.length === 0 ? (
              'Nobody'
            ) : (
              <>
                {joinNames(night.winnerNames.map(firstName))} <span aria-hidden>🏆</span>
              </>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

const steps = [
  { title: 'Deal the night', body: 'Date, spot and the usual buy-in. That’s all it takes.' },
  {
    title: 'Everyone grabs a seat',
    body: 'Each player logs their own buy-ins and rebuys from their phone.',
  },
  {
    title: 'Count up and close',
    body: 'Cash-outs go in, the books balance, and the winner gets the crown.',
  },
];

function HowItGoes() {
  return (
    <section
      aria-labelledby='how-heading'
      className='rounded-panel bg-surface p-6 shadow-card sm:p-7'>
      <h2 id='how-heading' className='text-xl font-bold tracking-tight'>
        How a night goes
      </h2>
      <ol className='mt-5 space-y-5'>
        {steps.map((step, index) => (
          <li key={step.title} className='flex gap-4'>
            <span
              aria-hidden
              className='grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-extrabold tabular-nums'>
              {index + 1}
            </span>
            <div className='min-w-0 pt-1'>
              <p className='font-extrabold'>{step.title}</p>
              <p className='mt-0.5 text-sm font-semibold text-ink-2'>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function NightHintsPanel({ hints }: { hints: NightHints }) {
  return (
    <div className='flex flex-col gap-6'>
      {hints.open && <OpenNightNote night={hints.open} />}
      {hints.last && <LastTimeCard night={hints.last} />}
      <HowItGoes />
    </div>
  );
}
