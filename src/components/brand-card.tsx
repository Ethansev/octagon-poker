import { OctagonMark } from '@/components/octagon-mark';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/theme/theme-toggle';
import Link from 'next/link';

export const brandLinkClass =
  'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-bold text-ink-2 transition hover:bg-surface-3 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none';

export const brandActionClass =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:-translate-y-0.5 hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none active:translate-y-0 motion-reduce:transition-none';

export function BrandScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className='relative grid min-h-dvh place-items-center px-4 py-20 sm:px-6'>
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6'>
        <ThemeToggle />
      </div>
      {children}
    </main>
  );
}

type BrandCardProps = {
  title: string;
  body: React.ReactNode;
  figure?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function BrandCard({ title, body, figure, footer, children, className }: BrandCardProps) {
  return (
    <div
      className={cn(
        'relative w-full max-w-[440px] overflow-hidden rounded-panel bg-surface p-8 shadow-card sm:p-10',
        className,
      )}>
      {figure && (
        <span
          aria-hidden
          className='pointer-events-none absolute -top-7 -right-3 text-[150px] leading-none font-bold tracking-tighter text-surface-3 tabular-nums select-none sm:text-[180px]'>
          {figure}
        </span>
      )}
      <div className='relative'>
        <Link
          href='/'
          aria-label='Back to the group'
          className='inline-block cursor-pointer rounded-md transition hover:rotate-[22.5deg] focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none'>
          <OctagonMark className='size-14 text-2xl' />
        </Link>
        <h1 className='mt-6 text-3xl leading-tight font-bold tracking-tight text-balance'>
          {title}
        </h1>
        <div className='mt-2 text-base leading-relaxed font-semibold text-ink-2'>{body}</div>
        {children && <div className='mt-8'>{children}</div>}
        {footer && <div className='mt-6 -ml-4 flex flex-wrap gap-1'>{footer}</div>}
      </div>
    </div>
  );
}
