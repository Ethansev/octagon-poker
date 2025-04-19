'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Player } from '@/dal/player';
import { PlayerSessionWithPlayerInfo } from '@/dal/player-session';
import { useRouter } from 'next/navigation';
import MainPlayer from './Player';

type PlayerDialogWrapperProps = { player: Player; playerSessions: PlayerSessionWithPlayerInfo[] };

export default function PlayerDialogWrapper({ player, playerSessions }: PlayerDialogWrapperProps) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && router.back()}>
      <DialogContent className='max-h-[90vh] w-[80%] overflow-y-auto sm:max-w-[80%]'>
        <DialogTitle>Player Page</DialogTitle>
        <MainPlayer playerSessions={playerSessions} player={player} />
      </DialogContent>
    </Dialog>
  );
}
