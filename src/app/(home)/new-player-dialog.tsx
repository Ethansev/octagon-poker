import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NewPlayerForm } from './new-player-form';

// async function handleNewPlayerSubmit(data: NewPlayerInput): Promise<NewPlayerResponse> {
//   const playerRes = await createNewPlayer(data);
//   if (playerRes.success && playerRes.player) {
//     const player = playerRes.player;
//     // TODO: handle error if we can't add it to the database
//     const groupRes: boolean = await addNewPlayerToGroup(player.id);
//     // toast.success('Player has been added successfully');
//   } else {
//     // toast.error('Error creating player');
//   }

//   return playerRes;
// }

export default function NewGameDialog() {
  return (
    <>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader className='mb-4'>
          <DialogTitle>Add a new player</DialogTitle>
          <DialogDescription>Add a new player to the existing group.</DialogDescription>
        </DialogHeader>

        <NewPlayerForm />
      </DialogContent>
    </>
  );
}
