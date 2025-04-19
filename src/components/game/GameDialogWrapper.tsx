'use client';

import SingleGame from '@/components/game/Game';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Game } from '@/dal/game';
import { Player } from '@/dal/player';
import { PlayerSessionWithPlayerInfo } from '@/dal/player-session';
import { useRouter } from 'next/navigation';

type GameDialogWrapperProps = {
  game: Game;
  players: Player[];
  playerSessions: PlayerSessionWithPlayerInfo[];
};

export default function GameDialogWrapper({
  game,
  players,
  playerSessions,
}: GameDialogWrapperProps) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent className='w-[80%] sm:max-w-[80%]'>
        <DialogTitle>Game Session</DialogTitle>
        <SingleGame game={game} players={players} playerSessions={playerSessions} />
      </DialogContent>
    </Dialog>
  );
}
