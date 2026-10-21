'use client';

import { authClient } from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <div className='flex flex-col gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' name='email' type='email' autoComplete='email' required />
      </div>
      <div className='flex flex-col gap-2'>
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
        <p role='alert' className='text-sm text-red-600'>
          {state.message}
        </p>
      )}
      <Button type='submit' disabled={state.kind === 'submitting'}>
        Sign in
      </Button>
    </form>
  );
}
