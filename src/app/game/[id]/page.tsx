import SingleGame from '@/components/game/Game';
import { getGameById } from '@/dal/game';
import { getPlayersPerGroup } from '@/dal/player';
import { getPlayerSessionsPerGame } from '@/dal/player-session';
import Link from 'next/link';

export type GameIdPageProps = { params: Promise<{ id: string }> };

export default async function GameIDPage(props: GameIdPageProps) {
  const params = await props.params;
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
