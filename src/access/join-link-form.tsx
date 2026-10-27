'use client';

import { joinWithLinkAction, type JoinWithLinkResult } from '@/access/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { useActionState } from 'react';

type JoinState = { kind: 'idle' } | JoinWithLinkResult;

export function JoinLinkForm() {
  const [state, submit, pending] = useActionState<JoinState, FormData>(
    (_previous: JoinState, formData: FormData) => joinWithLinkAction(formData),
    { kind: 'idle' },
  );
  const wrong = state.kind === 'wrong-link';

  return (
    <form action={submit} className='flex flex-col gap-3'>
      <Label htmlFor='join-link'>Group link</Label>
      <div className='flex gap-2'>
        <Input
          id='join-link'
          name='link'
          type='text'
          inputMode='url'
          placeholder='Paste it here'
          autoComplete='off'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
          required
          className='h-12'
          aria-invalid={wrong}
          aria-describedby={wrong ? 'join-link-error' : undefined}
        />
        <Button type='submit' size='lg' disabled={pending} className='shrink-0'>
          {pending ? 'Joining…' : 'Join'}
        </Button>
      </div>
      {wrong && (
        <p
          id='join-link-error'
          role='alert'
          className='flex items-center gap-1.5 rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          <CircleAlert aria-hidden className='size-4 shrink-0' />
          That link doesn’t open this group. Ask for the latest one.
        </p>
      )}
    </form>
  );
}
