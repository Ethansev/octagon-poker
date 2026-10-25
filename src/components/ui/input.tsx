import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'flex h-11 w-full min-w-0 rounded-2xl border border-line bg-surface px-4 py-2 text-base text-ink tabular-nums transition-[color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-ink placeholder:text-ink-3 hover:border-ink-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:[color-scheme:dark]',
        'focus-visible:border-focus focus-visible:ring-4 focus-visible:ring-focus/25',
        'aria-invalid:border-error aria-invalid:ring-4 aria-invalid:ring-error/15',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
