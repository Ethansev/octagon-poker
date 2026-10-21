'use client';

import { NightForm } from '@/app/(group)/nights/night-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  closeNightAction,
  deleteNightAction,
  reopenNightAction,
  updateNightAction,
} from '@/nights/actions';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

type NightOwnerActionsProps = {
  nightId: string;
  status: 'open' | 'closed';
  closeBlockedReason: string | null;
  details: { date: string; location: string; buyIn: string };
};

function useNightStatusActions(nightId: string) {
  const [pending, startTransition] = useTransition();

  function close() {
    startTransition(async () => {
      const result = await closeNightAction(nightId);
      if (result.kind === 'not-balanced') toast.error("The night doesn't balance yet.");
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  function reopen() {
    startTransition(async () => {
      await reopenNightAction(nightId);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteNightAction(nightId);
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  return { pending, close, reopen, remove };
}

function EditDetails({
  nightId,
  details,
}: {
  nightId: string;
  details: NightOwnerActionsProps['details'];
}) {
  const [open, setOpen] = useState(false);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Edit details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit night details</DialogTitle>
        </DialogHeader>
        <NightForm
          action={updateNightAction}
          nightId={nightId}
          defaults={details}
          submitLabel='Save details'
          onSaved={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeleteNight({ pending, onConfirm }: { pending: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='text-red-600 hover:text-red-700'
          disabled={pending}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this night?</AlertDialogTitle>
          <AlertDialogDescription>
            Its players&apos; rows and activity log go with it, and the standings change. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete night</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function NightOwnerActions({
  nightId,
  status,
  closeBlockedReason,
  details,
}: NightOwnerActionsProps) {
  const actions = useNightStatusActions(nightId);

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-2'>
        {status === 'open' ? (
          <>
            <Button
              size='sm'
              disabled={closeBlockedReason !== null || actions.pending}
              onClick={actions.close}>
              Close night
            </Button>
            <EditDetails nightId={nightId} details={details} />
          </>
        ) : (
          <Button size='sm' variant='outline' disabled={actions.pending} onClick={actions.reopen}>
            Reopen night
          </Button>
        )}
        <DeleteNight pending={actions.pending} onConfirm={actions.remove} />
      </div>
      {status === 'open' && closeBlockedReason !== null && (
        <p className='text-sm text-slate-500'>{closeBlockedReason}</p>
      )}
    </div>
  );
}
