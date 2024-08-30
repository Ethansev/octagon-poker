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
        <DialogHeader>
          <DialogTitle>Add a new game</DialogTitle>
          <DialogDescription>Add a new game session to the existing group.</DialogDescription>
        </DialogHeader>

        <NewGameForm />

        {/* <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input id='name' defaultValue='Pedro Duarte' className='col-span-3' />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Username
            </Label>
            <Input id='username' defaultValue='@peduarte' className='col-span-3' />
          </div>
        </div> */}

        {/* <DialogFooter>
          <Button type='submit'>Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </>
  );
}
