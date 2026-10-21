import { formatNet } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import { nightWinners, seatNet, type ClosedNight } from '@/stats/nights';
import Link from 'next/link';

export function LastNightCard({
  night,
  location,
  names,
}: {
  night: ClosedNight;
  location: string | null;
  names: Map<string, string>;
}) {
  const winnerIds = nightWinners(night.seats);
  const top = night.seats.find((seat) => seat.playerId === winnerIds[0]);
  const winnerNames = winnerIds
    .map((id) => names.get(id) ?? 'Unknown')
    .sort((a, b) => a.localeCompare(b));

  return (
    <Link
      href={`/nights/${night.id}`}
      className='block rounded-xl bg-slate-900 px-3 py-2.5 text-white'>
      <div className='text-[10px] font-semibold tracking-wider text-slate-400 uppercase'>
        Last night · {formatNightDate(night.date)}
        {location ? ` at ${location}` : ''}
      </div>
      <div className='text-base font-bold'>
        {top === undefined ? (
          'No winner. Nobody finished up.'
        ) : (
          <>
            {joinNames(winnerNames)} took it{' '}
            <span className='text-green-400'>{formatNet(seatNet(top))}</span>
          </>
        )}
      </div>
    </Link>
  );
}
