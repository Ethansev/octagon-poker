import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold whitespace-nowrap transition outline-none focus-visible:ring-4 focus-visible:ring-focus/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-4 aria-invalid:ring-error/25 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-ink hover:bg-primary-hover',
        destructive: 'bg-error text-error-ink hover:bg-error/90',
        outline: 'border border-line bg-surface text-ink hover:border-ink-3 hover:bg-surface-2',
        secondary: 'bg-surface-3 text-ink hover:bg-line',
        ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
        link: 'rounded-md text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3',
        lg: 'h-12 px-7 text-base has-[>svg]:px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
