import { formatNet } from '@/money/money';
import type { Standing } from '@/stats/standings';
import Link from 'next/link';

type StandingsBlockProps = {
  ranked: Standing[];
  unranked: Standing[];
  names: Map<string, string>;
  heading: string;
};

function PlayerLink({ id, names }: { id: string; names: Map<string, string> }) {
  return (
    <Link href={`/players/${id}`} className='flex-1 font-semibold text-slate-900'>
      {names.get(id) ?? 'Unknown'}
    </Link>
  );
}

export function StandingsBlock({ ranked, unranked, names, heading }: StandingsBlockProps) {
  return (
    <section>
      {ranked.length > 0 && (
        <>
          <h2 className='mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
            {heading}
          </h2>
          <ul>
            {ranked.map((row, index) => (
              <li
                key={row.playerId}
                className='flex items-center border-b border-slate-100 px-0.5 py-2'>
                <span className='w-5 text-xs text-slate-400'>{index + 1}</span>
                <PlayerLink id={row.playerId} names={names} />
                <span className='min-w-14 text-right font-bold text-green-700'>
                  {formatNet(row.netCents)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {unranked.length > 0 && (
        <>
          {ranked.length > 0 && (
            <div className='my-1.5 text-center text-[10px] text-slate-400'>· · ·</div>
          )}
          <ul>
            {unranked.map((row) => (
              <li
                key={row.playerId}
                className='flex items-center border-b border-slate-100 px-0.5 py-2'>
                <span className='w-5' />
                <Link
                  href={`/players/${row.playerId}`}
                  className='flex-1 font-medium text-slate-500'>
                  {names.get(row.playerId) ?? 'Unknown'}
                </Link>
                <span className='mr-2 text-xs text-slate-500'>
                  {row.nightsPlayed} {row.nightsPlayed === 1 ? 'night' : 'nights'}
                </span>
                <span className='min-w-14 text-right text-slate-400'>
                  {formatNet(row.netCents)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
