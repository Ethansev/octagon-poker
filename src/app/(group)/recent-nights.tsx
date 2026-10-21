import { formatNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import type { NightSummary } from '@/nights/nights';
import Link from 'next/link';

function winnerLabel(night: NightSummary): string {
  if (night.status === 'open') return 'Open';
  if (night.winnerNames.length === 0) return 'No winner';
  return joinNames(night.winnerNames);
}

export function RecentNights({ nights }: { nights: NightSummary[] }) {
  if (nights.length === 0) return null;
  return (
    <section>
      <h2 className='mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
        Recent nights
      </h2>
      <ul>
        {nights.map((night) => (
          <li key={night.id} className='border-b border-slate-100'>
            <Link
              href={`/nights/${night.id}`}
              className='flex items-center justify-between gap-3 px-0.5 py-2'>
              <span className='min-w-0'>
                <span className='block font-semibold text-slate-900'>
                  {formatNightDate(night.date)}
                </span>
                {night.location && (
                  <span className='block truncate text-xs text-slate-500'>{night.location}</span>
                )}
              </span>
              <span
                className={`shrink-0 text-xs ${night.status === 'open' ? 'font-semibold text-green-700' : 'text-slate-600'}`}>
                {winnerLabel(night)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
