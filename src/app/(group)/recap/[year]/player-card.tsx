import { formatNet } from '@/money/money';
import type { PlayerSeason } from '@/stats/player-season';
import Link from 'next/link';

type PlayerCardProps = { player: PlayerSeason; name: string; year: number };

export function PlayerCard({ player, name, year }: PlayerCardProps) {
  return (
    <li className='flex items-center justify-between rounded-2xl bg-surface px-3 py-2.5 shadow-card'>
      <div>
        <Link
          href={`/players/${player.playerId}?season=${year}`}
          className='font-semibold text-ink'>
          {name}
        </Link>
        <p className='text-xs text-ink-2'>
          {player.nightsPlayed} {player.nightsPlayed === 1 ? 'night' : 'nights'} played ·{' '}
          {player.nightsWon} won
        </p>
      </div>
      <span
        className={`text-lg font-bold tabular-nums ${player.netCents > 0 ? 'text-win' : 'text-loss'}`}>
        {formatNet(player.netCents)}
      </span>
    </li>
  );
}
