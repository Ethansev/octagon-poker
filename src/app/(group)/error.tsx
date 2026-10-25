'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GroupError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className='mx-auto max-w-md space-y-4 p-4 pt-12 text-center'>
      <h1 className='text-xl font-extrabold text-ink'>Something went wrong.</h1>
      <div className='flex items-center justify-center gap-3'>
        <Button onClick={reset}>Try again</Button>
        <Link href='/' className='text-sm text-ink-2 underline'>
          Back to the group
        </Link>
      </div>
    </div>
  );
}
