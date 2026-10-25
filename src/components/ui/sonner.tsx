'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function toasterTheme(resolved: string | undefined): ToasterProps['theme'] {
  return resolved === 'dark' ? 'dark' : 'light';
}

function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={toasterTheme(resolvedTheme)}
      className='toaster group'
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl! border-line! bg-surface! text-ink! shadow-pop! font-sans!',
          description: 'text-ink-2!',
          success: '[&_[data-icon]]:text-win',
          error: '[&_[data-icon]]:text-error',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
