import MainPlayer from '@/components/player/main-player';
import { getPlayerById } from '@/dal/player';
import { getPlayerSessionsPerPlayer, PlayerSessionWithPlayerInfo } from '@/dal/player-session';

export type PlayerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerPage(props: PlayerPageProps) {
  const params = await props.params;
  const playerSessions: PlayerSessionWithPlayerInfo[] = await getPlayerSessionsPerPlayer(
    Number(params.id),
  );
  const player = await getPlayerById(Number(params.id));
  console.log('printing player sessions: ', playerSessions);
  console.log('printing player: ', player);

  return <MainPlayer playerSessions={playerSessions} player={player} />;
}
