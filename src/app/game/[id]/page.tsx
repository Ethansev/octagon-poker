import SingleGame from '@/components/game/game';
import { getGameById } from '@/dal/game';
import { getPlayersPerGroup } from '@/dal/player';
import { getPlayerSessionsPerGame } from '@/dal/player-session';
import Link from 'next/link';

export default async function GameIDPage({ params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  const players = await getPlayersPerGroup(1);
  const playerSessions = await getPlayerSessionsPerGame(gameId);
  const game = await getGameById(Number(gameId));

  return (
    <div className='p-8'>
      <div className='mb-4 font-semibold text-red-300'>
        <Link className='' href='/'>
          You&apos;re drunk, go home
        </Link>
      </div>

      <SingleGame game={game} players={players} playerSessions={playerSessions} />
    </div>
  );
}
