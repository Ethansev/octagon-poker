'use client';

import { closeNightAction } from '@/nights/actions';
import { Crown } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

function useCloseNight(nightId: string) {
  const [pending, startTransition] = useTransition();

  function close() {
    startTransition(async () => {
      const result = await closeNightAction(nightId);
      if (result.kind === 'not-balanced') toast.error("The night doesn't balance yet.");
      if (result.kind === 'no-bank') toast.error("Pick who's holding the bank first.");
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  return { pending, close };
}

export function CloseNightButton({
  nightId,
  blockedReason,
}: {
  nightId: string;
  blockedReason: string | null;
}) {
  const closing = useCloseNight(nightId);

  return (
    <div className='mt-5'>
      <button
        type='button'
        disabled={blockedReason !== null || closing.pending}
        aria-describedby={blockedReason === null ? undefined : 'close-blocked-reason'}
        onClick={closing.close}
        className='inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-3 motion-reduce:transition-none'>
        <Crown aria-hidden className='size-4' strokeWidth={2.5} />
        {closing.pending ? (
          'Closing…'
        ) : (
          <span>
            Close the night<span className='hidden sm:inline'> and crown the winner</span>
          </span>
        )}
      </button>
      {blockedReason !== null && (
        <p id='close-blocked-reason' className='mt-2 text-center text-sm font-semibold text-ink-2'>
          {blockedReason}
        </p>
      )}
    </div>
  );
}
