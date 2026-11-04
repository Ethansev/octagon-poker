'use client';

import { joinGroupAction, type JoinGroupResult } from '@/access/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useActionState } from 'react';

type JoinState = { kind: 'idle' } | JoinGroupResult;

export function JoinForm() {
  const pathname = usePathname();
  const [state, submit, pending] = useActionState<JoinState, FormData>(
    (_previous: JoinState, formData: FormData) => joinGroupAction(formData),
    { kind: 'idle' },
  );
  const wrong = state.kind === 'wrong-password';

  return (
    <form action={submit} className='flex flex-col gap-3'>
      <input type='hidden' name='landing' value={pathname} />
      <Label htmlFor='join-entry'>Group password</Label>
      <div className='flex gap-2'>
        <Input
          id='join-entry'
          name='entry'
          type='text'
          autoComplete='off'
          autoCapitalize='none'
          autoCorrect='off'
          spellCheck={false}
          required
          className='h-12'
          aria-invalid={wrong}
          aria-describedby={wrong ? 'join-entry-error' : undefined}
        />
        <Button type='submit' size='lg' disabled={pending} className='shrink-0'>
          {pending ? 'Joining…' : 'Join'}
        </Button>
      </div>
      {wrong && (
        <p
          id='join-entry-error'
          role='alert'
          className='flex items-center gap-1.5 rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          <CircleAlert aria-hidden className='size-4 shrink-0' />
          That’s not it. Ask the host for the password.
        </p>
      )}
    </form>
  );
}
