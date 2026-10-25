'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='sheet' {...props} />;
}

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0' />
      <DialogPrimitive.Content
        data-slot='sheet-content'
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-panel bg-surface pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-pop outline-none data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:slide-in-from-bottom',
          className,
        )}
        {...props}>
        <div aria-hidden className='mx-auto mt-3 h-1.5 w-10 rounded-full bg-ink/15' />
        {children}
        <DialogPrimitive.Close className='absolute top-4 right-4 inline-grid size-10 cursor-pointer place-items-center rounded-full bg-surface/70 text-ink-2 transition hover:bg-surface hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
          <XIcon aria-hidden className='size-4' />
          <span className='sr-only'>Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot='sheet-title'
      className={cn('text-xl leading-tight font-bold tracking-tight', className)}
      {...props}
    />
  );
}

export { Sheet, SheetContent, SheetTitle };
