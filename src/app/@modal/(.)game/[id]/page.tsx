import SingleGame from '@/components/game/game';
import { Modal } from '@/components/modal';
import { getGameById } from '@/dal/game';
import { getPlayersPerGroup } from '@/dal/player';
import { getPlayerSessionsPerGame } from '@/dal/player-session';

export default async function GameIDPage({ params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  const players = await getPlayersPerGroup(1);
  const playerSessions = await getPlayerSessionsPerGame(gameId);
  const game = await getGameById(Number(gameId));

  return (
    <Modal title='Game Session'>
      <SingleGame game={game} players={players} playerSessions={playerSessions} />
    </Modal>
  );
}
