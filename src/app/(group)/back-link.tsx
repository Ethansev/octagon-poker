import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className='inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-surface/70 pr-4 pl-3 text-sm font-extrabold text-ink-2 transition hover:bg-surface hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
      <ArrowLeft aria-hidden className='size-4' strokeWidth={3} />
      {children}
    </Link>
  );
}
