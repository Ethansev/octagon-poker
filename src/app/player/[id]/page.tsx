import Player from '@/components/player/Player';
import { getPlayerById } from '@/dal/player';
import { getPlayerSessionsPerPlayer, PlayerSessionWithPlayerInfo } from '@/dal/player-session';
import Link from 'next/link';

export type PlayerPageProps = { params: Promise<{ id: string }> };

export default async function PlayerPage(props: PlayerPageProps) {
  const params = await props.params;
  const playerSessions: PlayerSessionWithPlayerInfo[] = await getPlayerSessionsPerPlayer(
    Number(params.id),
  );
  const player = await getPlayerById(Number(params.id));
  console.log('printing player sessions: ', playerSessions);
  console.log('printing player: ', player);

  // TODO: use a header in layout instead of a link
  return (
    <div className='container mx-auto'>
      <Link href='/'>Back to Home</Link>
      <Player playerSessions={playerSessions} player={player} />
    </div>
  );
}
