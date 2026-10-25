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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteNightAction, reopenNightAction, updateNightAction } from '@/nights/actions';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

type NightOwnerActionsProps = {
  nightId: string;
  status: 'open' | 'closed';
  details: { date: string; location: string; buyIn: string };
};

const pill =
  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-extrabold text-ink transition hover:border-ink-3 hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

function useNightStatusActions(nightId: string) {
  const [pending, startTransition] = useTransition();

  function reopen() {
    startTransition(async () => {
      const result = await reopenNightAction(nightId);
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteNightAction(nightId);
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  return { pending, reopen, remove };
}

function EditDetails({ nightId, details }: Omit<NightOwnerActionsProps, 'status'>) {
  const [open, setOpen] = useState(false);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type='button' className={pill}>
          <Pencil aria-hidden className='size-4' />
          Edit details
        </button>
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
        <button
          type='button'
          aria-label='Delete night'
          title='Delete night'
          disabled={pending}
          className='inline-grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-error/40 hover:bg-error-soft hover:text-error focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
          <Trash2 aria-hidden className='size-4' />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this night?</AlertDialogTitle>
          <AlertDialogDescription>
            Its seats and activity go with it, and the standings change. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction variant='destructive' onClick={onConfirm}>
            Delete night
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function NightOwnerActions({ nightId, status, details }: NightOwnerActionsProps) {
  const actions = useNightStatusActions(nightId);

  return (
    <div role='group' aria-label='Host actions' className='flex items-center gap-2'>
      {status === 'open' ? (
        <EditDetails nightId={nightId} details={details} />
      ) : (
        <button type='button' className={pill} disabled={actions.pending} onClick={actions.reopen}>
          <RotateCcw aria-hidden className='size-4' />
          {actions.pending ? 'Reopening…' : 'Reopen night'}
        </button>
      )}
      <DeleteNight pending={actions.pending} onConfirm={actions.remove} />
    </div>
  );
}
