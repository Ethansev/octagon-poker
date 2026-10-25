'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type='button'
      aria-label='Toggle dark mode'
      title='Toggle dark mode'
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className='inline-grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition hover:border-ink-3 hover:bg-surface hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
      <Moon aria-hidden className='size-[18px] dark:hidden' />
      <Sun aria-hidden className='hidden size-[18px] dark:block' />
    </button>
  );
}
