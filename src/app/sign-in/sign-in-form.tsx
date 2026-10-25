'use client';

import { authClient } from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type SignInState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'failed'; message: string };

export function SignInForm() {
  const router = useRouter();
  const [state, setState] = useState<SignInState>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    setState({ kind: 'submitting' });
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setState({ kind: 'failed', message: 'Wrong email or password.' });
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2.5'>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' name='email' type='email' autoComplete='email' required />
      </div>
      <div className='flex flex-col gap-2.5'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          name='password'
          type='password'
          autoComplete='current-password'
          required
        />
      </div>
      {state.kind === 'failed' && (
        <p
          role='alert'
          className='flex items-center gap-1.5 rounded-2xl bg-error-soft px-4 py-3 text-sm font-semibold text-error'>
          <CircleAlert aria-hidden className='size-4 shrink-0' />
          {state.message}
        </p>
      )}
      <Button
        type='submit'
        size='lg'
        disabled={state.kind === 'submitting'}
        className='mt-1 w-full'>
        {state.kind === 'submitting' ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
