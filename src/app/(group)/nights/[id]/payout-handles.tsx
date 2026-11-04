'use client';

import { useCopyLink } from '@/access/use-copy-link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { savePayoutHandlesAction } from '@/nights/actions';
import { PaymentFields } from '@/players/payment-fields';
import {
  venmoProfileUrl,
  type PaymentHandleField,
  type PaymentHandles,
} from '@/players/payment-handles';
import { Check, Copy, ExternalLink, Pencil, Plus } from 'lucide-react';
import { useState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

type PayoutHandlesProps = {
  nightId: string;
  playerId: string;
  name: string;
  handles: PaymentHandles;
};

const chip =
  'inline-flex h-9 max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-full bg-surface px-3 text-sm font-bold text-ink transition hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none';

function CopyChip({ service, value, name }: { service: string; value: string; name: string }) {
  const { state, copy } = useCopyLink(value);
  const copied = state.kind === 'copied';

  return (
    <button type='button' onClick={copy} title={value} className={chip}>
      {copied ? (
        <Check aria-hidden className='size-3.5 shrink-0 text-win' strokeWidth={3} />
      ) : (
        <Copy aria-hidden className='size-3.5 shrink-0 text-ink-2' />
      )}
      <span className='shrink-0 text-ink-2'>{service}</span>
      <span aria-live='polite' className='truncate'>
        {copied ? 'Copied' : value}
      </span>
      <span className='sr-only'>, copy for {name}</span>
    </button>
  );
}

function useSaveHandles(props: Pick<PayoutHandlesProps, 'nightId' | 'playerId'>) {
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState<PaymentHandleField | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await savePayoutHandlesAction({
        ...props,
        venmo: String(form.get('venmo') ?? ''),
        zelle: String(form.get('zelle') ?? ''),
      });
      if (result.kind === 'invalid-handle') {
        setInvalid(result.field);
        return;
      }
      setInvalid(null);
      if (result.kind === 'saved') {
        setOpen(false);
        toast.success('Payment info saved.');
      } else {
        toast.error('Only the host or the bank can change this.');
      }
    });
  }

  return { open, setOpen, invalid, pending, onSubmit };
}

export function PayoutHandles({ nightId, playerId, name, handles }: PayoutHandlesProps) {
  const { open, setOpen, invalid, pending, onSubmit } = useSaveHandles({ nightId, playerId });
  const { venmoHandle, zelleHandle } = handles;
  const empty = venmoHandle === null && zelleHandle === null;

  return (
    <div className='mt-2 flex flex-wrap items-center gap-1.5 pr-1 pb-1'>
      {venmoHandle !== null && (
        <>
          <CopyChip service='Venmo' value={venmoHandle} name={name} />
          <a
            href={venmoProfileUrl(venmoHandle)}
            target='_blank'
            rel='noreferrer'
            aria-label={`Open ${name}’s Venmo`}
            title='Open Venmo'
            className={`${chip} w-9 shrink-0 justify-center px-0`}>
            <ExternalLink aria-hidden className='size-3.5 text-ink-2' />
          </a>
        </>
      )}
      {zelleHandle !== null && <CopyChip service='Zelle' value={zelleHandle} name={name} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {empty ? (
            <button type='button' className={`${chip} text-ink-2`}>
              <Plus aria-hidden className='size-3.5' strokeWidth={3} />
              Add Venmo or Zelle<span className='sr-only'> for {name}</span>
            </button>
          ) : (
            <button
              type='button'
              aria-label={`Change ${name}’s payment info`}
              title='Change payment info'
              className={`${chip} w-9 shrink-0 justify-center px-0`}>
              <Pencil aria-hidden className='size-3.5 text-ink-2' />
            </button>
          )}
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{name}’s payment info</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className='flex flex-col gap-4'>
            <PaymentFields idPrefix={`payout-${playerId}`} defaults={handles} invalid={invalid} />
            <p className='text-sm font-semibold text-ink-2'>
              This updates their player card, and the change shows in tonight’s activity.
            </p>
            <Button type='submit' disabled={pending} className='h-11'>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
