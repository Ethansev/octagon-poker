import PlayerDialogWrapper from '@/components/player/PlayerDialogWrapper';
import { getPlayerById } from '@/dal/player';
import { getPlayerSessionsPerPlayer } from '@/dal/player-session';

export type PlayerPageModalProps = { params: Promise<{ id: string }> };

export default async function PlayerIDPage(props: PlayerPageModalProps) {
  const params = await props.params;
  const playerId = Number(params.id);

  const playerSessions = await getPlayerSessionsPerPlayer(playerId);
  const player = await getPlayerById(playerId);

  if (!player) {
    return <div>Player not found</div>;
  }

  return <PlayerDialogWrapper player={player} playerSessions={playerSessions} />;
}
