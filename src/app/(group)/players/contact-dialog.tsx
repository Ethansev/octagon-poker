'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addContactAction, updateContactAction } from '@/players/actions';
import { PaymentFields } from '@/players/payment-fields';
import type { PaymentHandleField } from '@/players/payment-handles';
import type { Contact } from '@/players/players';
import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

type FormError = { kind: 'name'; message: string } | { kind: 'handle'; field: PaymentHandleField };

type ContactDialogProps = {
  contact: Contact | null;
  trigger: ReactNode;
};

const emptyHandles = { venmoHandle: null, zelleHandle: null };

function useSaveContact(contact: Contact | null) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = contact
        ? await updateContactAction(contact.id, form)
        : await addContactAction(form);
      switch (result.kind) {
        case 'saved':
          setError(null);
          setOpen(false);
          toast.success(contact ? 'Player saved.' : 'Player added.');
          return;
        case 'invalid-handle':
          setError({ kind: 'handle', field: result.field });
          return;
        case 'name-taken':
          setError({ kind: 'name', message: 'Someone already has that name.' });
          return;
        case 'invalid-name':
          setError({ kind: 'name', message: 'Enter a name up to 40 characters.' });
          return;
        default:
          toast.error('Couldn’t save that player.');
      }
    });
  }

  return { open, setOpen, error, pending, onSubmit };
}

export function ContactDialog({ contact, trigger }: ContactDialogProps) {
  const { open, setOpen, error, pending, onSubmit } = useSaveContact(contact);
  const idPrefix = `contact-${contact?.id ?? 'new'}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{contact ? `Edit ${contact.name}` : 'Add a player'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor={`${idPrefix}-name`}>Name</Label>
            <Input
              id={`${idPrefix}-name`}
              name='name'
              defaultValue={contact?.name ?? ''}
              maxLength={40}
              required
              aria-invalid={error?.kind === 'name'}
            />
            {error?.kind === 'name' && (
              <p role='alert' className='text-sm font-semibold text-error'>
                {error.message}
              </p>
            )}
          </div>
          <PaymentFields
            idPrefix={idPrefix}
            defaults={contact ?? emptyHandles}
            invalid={error?.kind === 'handle' ? error.field : null}
          />
          <Button type='submit' disabled={pending} className='h-11'>
            {pending ? 'Saving…' : contact ? 'Save' : 'Add player'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
