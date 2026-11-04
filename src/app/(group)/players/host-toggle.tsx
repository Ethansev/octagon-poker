'use client';

import { cn } from '@/lib/utils';
import { setHostPlayerAction } from '@/players/actions';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function HostToggle({ playerId, isHost }: { playerId: string; isHost: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setHostPlayerAction(isHost ? null : playerId);
      if (result.kind !== 'saved') toast.error('Couldn’t change that.');
    });
  }

  return (
    <button
      type='button'
      onClick={toggle}
      disabled={pending}
      aria-pressed={isHost}
      className={cn(
        'inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full px-3 text-xs font-extrabold whitespace-nowrap transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
        isHost ? 'bg-ink text-surface' : 'bg-surface-3 text-ink-2 hover:text-ink',
      )}>
      {isHost ? 'You' : 'This is me'}
    </button>
  );
}
