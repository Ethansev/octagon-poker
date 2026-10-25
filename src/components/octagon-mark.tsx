import { cn } from '@/lib/utils';

export function OctagonMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 shrink-0 place-items-center bg-logo text-lg font-extrabold text-logo-ink [clip-path:polygon(30%_0,70%_0,100%_30%,100%_70%,70%_100%,30%_100%,0_70%,0_30%)]',
        className,
      )}>
      8
    </span>
  );
}
