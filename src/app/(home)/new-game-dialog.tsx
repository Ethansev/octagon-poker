import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NewGameForm } from './new-game-form';

export default function NewGameDialog() {
  return (
    <>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader className='mb-4'>
          <DialogTitle>Add a new game</DialogTitle>
          <DialogDescription>Add a new game session to the existing group.</DialogDescription>
        </DialogHeader>

        <NewGameForm />

        {/* <DialogFooter>
          <Button type='submit'>Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </>
  );
}
