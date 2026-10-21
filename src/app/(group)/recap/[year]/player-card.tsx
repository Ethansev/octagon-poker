import { formatNet } from '@/money/money';
import type { PlayerSeason } from '@/stats/player-season';
import Link from 'next/link';

type PlayerCardProps = { player: PlayerSeason; name: string; year: number };

export function PlayerCard({ player, name, year }: PlayerCardProps) {
  return (
    <li className='flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5'>
      <div>
        <Link
          href={`/players/${player.playerId}?season=${year}`}
          className='font-semibold text-slate-900'>
          {name}
        </Link>
        <p className='text-xs text-slate-500'>
          {player.nightsPlayed} {player.nightsPlayed === 1 ? 'night' : 'nights'} played ·{' '}
          {player.nightsWon} won
        </p>
      </div>
      <span
        className={`text-lg font-bold ${player.netCents > 0 ? 'text-green-700' : 'text-slate-500'}`}>
        {formatNet(player.netCents)}
      </span>
    </li>
  );
}
