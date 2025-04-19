import GameDialogWrapper from '@/components/game/GameDialogWrapper';
import { getGameById } from '@/dal/game';
import { getPlayersPerGroup } from '@/dal/player';
import { getPlayerSessionsPerGame } from '@/dal/player-session';

export type GameIDPageProps = { params: Promise<{ id: string }> };

export default async function GameIDPage(props: GameIDPageProps) {
  const params = await props.params;
  const gameId = Number(params.id);

  const players = await getPlayersPerGroup(1);
  const playerSessions = await getPlayerSessionsPerGame(gameId);
  const game = await getGameById(Number(gameId));

  if (!game) {
    return <div>Game not found</div>;
  }

  return <GameDialogWrapper game={game} players={players} playerSessions={playerSessions} />;
}
