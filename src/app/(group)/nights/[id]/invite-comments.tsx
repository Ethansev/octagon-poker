'use client';

import { Input } from '@/components/ui/input';
import { addCommentAction, removeCommentAction } from '@/nights/invite-actions';
import { Trash2 } from 'lucide-react';
import { useRef, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';

export function CommentComposer({ nightId }: { nightId: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = String(new FormData(event.currentTarget).get('body') ?? '');
    startTransition(async () => {
      const result = await addCommentAction({ nightId, body });
      if (result.kind === 'saved') form.current?.reset();
      else if (result.kind === 'invalid-body') toast.error('Keep it between 1 and 500 characters.');
      else toast.error('Couldn’t post that. Try again.');
    });
  }

  return (
    <form ref={form} onSubmit={onSubmit} className='flex min-w-0 flex-1 items-center gap-2'>
      <Input
        name='body'
        aria-label='Add a comment'
        placeholder='Add a comment…'
        maxLength={500}
        autoComplete='off'
        required
        className='h-12 min-w-0 flex-1'
      />
      <button
        type='submit'
        disabled={pending}
        className='inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-ink px-5 text-sm font-extrabold text-surface transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60'>
        {pending ? 'Posting…' : 'Post'}
      </button>
    </form>
  );
}

export function DeleteCommentButton({
  nightId,
  commentId,
}: {
  nightId: string;
  commentId: string;
}) {
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await removeCommentAction({ nightId, commentId });
      if (result.kind !== 'removed') toast.error('Couldn’t delete that comment.');
    });
  }

  return (
    <button
      type='button'
      aria-label='Delete comment'
      title='Delete comment'
      disabled={pending}
      onClick={remove}
      className='inline-grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-error-soft hover:text-error focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60'>
      <Trash2 aria-hidden className='size-4' />
    </button>
  );
}
