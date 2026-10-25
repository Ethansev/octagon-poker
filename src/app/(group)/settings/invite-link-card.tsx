'use client';

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
import { resetInviteAction } from '@/groups/actions';
import { cn } from '@/lib/utils';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

type CopyState = { kind: 'idle' } | { kind: 'copied' };

const COPIED_FOR_MS = 2000;

function useCopyLink(link: string) {
  const [state, setState] = useState<CopyState>({ kind: 'idle' });

  useEffect(() => {
    if (state.kind !== 'copied') return;
    const timer = setTimeout(() => setState({ kind: 'idle' }), COPIED_FOR_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState({ kind: 'copied' });
    } catch {
      toast.error("Couldn't copy. Select the link and copy it by hand.");
    }
  }

  return { state, copy };
}

function useResetLink(initial: string) {
  const [link, setLink] = useState(initial);
  const [pending, startTransition] = useTransition();

  function reset() {
    startTransition(async () => {
      const result = await resetInviteAction();
      setLink(result.joinUrl);
      toast.success('New link ready. Send it to the crew.');
    });
  }

  return { link, pending, reset };
}

export function InviteLinkCard({ joinUrl }: { joinUrl: string }) {
  const { link, pending, reset } = useResetLink(joinUrl);
  const { state, copy } = useCopyLink(link);
  const copied = state.kind === 'copied';

  return (
    <section
      aria-labelledby='invite-heading'
      className='rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-8'>
      <p className='text-xs font-extrabold tracking-[0.14em] text-hero-muted uppercase'>
        Group link
      </p>
      <h2
        id='invite-heading'
        className='mt-2 text-3xl leading-tight font-bold tracking-tight sm:text-4xl'>
        Invite the crew
      </h2>
      <p className='mt-2 max-w-[46ch] text-sm font-semibold text-hero-muted'>
        Anyone with this link can see the books and log their seat. Drop it in the group chat.
      </p>

      <div className='mt-6 flex flex-col gap-2 rounded-3xl bg-hero-chip-muted p-2 ring-1 ring-current/15 sm:flex-row sm:items-center'>
        <input
          readOnly
          value={link}
          aria-label='Group link'
          onFocus={(event) => event.currentTarget.select()}
          className='h-11 min-w-0 flex-1 truncate rounded-2xl bg-transparent px-3 font-mono text-sm text-hero-ink outline-none focus-visible:ring-2 focus-visible:ring-focus'
        />
        <button
          type='button'
          onClick={copy}
          className={cn(
            'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
            copied
              ? 'bg-live text-live-ink'
              : 'bg-primary text-primary-ink hover:-translate-y-0.5 hover:bg-primary-hover',
          )}>
          {copied ? (
            <Check aria-hidden className='size-4' strokeWidth={3} />
          ) : (
            <Copy aria-hidden className='size-4' />
          )}
          <span aria-live='polite'>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type='button'
            disabled={pending}
            className='mt-4 -ml-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-bold text-hero-muted transition hover:bg-hero-chip-muted hover:text-hero-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
            <RotateCcw aria-hidden className='size-4' />
            {pending ? 'Resetting…' : 'Reset link'}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the group link?</AlertDialogTitle>
            <AlertDialogDescription>
              Everyone using the old link loses edit access until they open the new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={reset}>Reset link</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
