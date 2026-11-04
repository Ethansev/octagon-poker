'use client';

import { forgetMeAction } from '@/players/actions';
import { useTransition } from 'react';

export function NotYouButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type='button'
      disabled={pending}
      onClick={() => startTransition(() => forgetMeAction())}
      className='cursor-pointer font-bold underline underline-offset-2 hover:text-hero-ink disabled:cursor-wait'>
      Not you?
    </button>
  );
}
