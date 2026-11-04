'use client';

import { cn } from '@/lib/utils';
import { setRsvpAction } from '@/nights/invite-actions';
import type { NightResponse } from '@/nights/invites';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

const choices: { response: NightResponse; label: string }[] = [
  { response: 'going', label: 'I’m in' },
  { response: 'maybe', label: 'Maybe' },
  { response: 'out', label: 'Can’t' },
];

export function InviteReply({
  nightId,
  current,
}: {
  nightId: string;
  current: NightResponse | null;
}) {
  const [, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(current);

  function reply(response: NightResponse) {
    startTransition(async () => {
      setShown(response);
      const result = await setRsvpAction({ nightId, response });
      if (result.kind === 'night-closed') toast.error('This night is already in the books.');
      else if (result.kind !== 'saved') toast.error('Couldn’t save that. Try again.');
    });
  }

  return (
    <div role='group' aria-label='Your reply' className='flex gap-2'>
      {choices.map(({ response, label }) => {
        const selected = shown === response;
        return (
          <button
            key={response}
            type='button'
            aria-pressed={selected}
            onClick={() => reply(response)}
            className={cn(
              'inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
              selected
                ? 'bg-primary text-primary-ink'
                : 'bg-hero-chip-muted text-hero-ink ring-1 ring-current/20 hover:ring-current/50',
            )}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
