'use client';

import { useCopyLink } from '@/access/use-copy-link';
import { cn } from '@/lib/utils';
import { Check, Share2 } from 'lucide-react';

type NightInviteButtonProps = {
  link: string;
  title: string;
  status: 'open' | 'closed';
};

function useNightInvite(link: string, title: string) {
  const { state, copy } = useCopyLink(link);

  async function invite() {
    const onPhone = window.matchMedia('(pointer: coarse)').matches;
    if (!onPhone || !('share' in navigator)) {
      await copy();
      return;
    }
    try {
      await navigator.share({ title, url: link });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copy();
    }
  }

  return { copied: state.kind === 'copied', invite };
}

export function NightInviteButton({ link, title, status }: NightInviteButtonProps) {
  const { copied, invite } = useNightInvite(link, title);

  return (
    <button
      type='button'
      onClick={invite}
      className={cn(
        'inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
        copied ? 'bg-live text-live-ink' : 'bg-primary text-primary-ink hover:bg-primary-hover',
      )}>
      {copied ? (
        <Check aria-hidden className='size-4' strokeWidth={3} />
      ) : (
        <Share2 aria-hidden className='size-4' />
      )}
      <span aria-live='polite'>
        {copied ? 'Link copied' : status === 'open' ? 'Invite' : 'Share'}
      </span>
    </button>
  );
}
