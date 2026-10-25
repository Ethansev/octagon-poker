import { cn } from '@/lib/utils';

export const STORY_COUNT = 5;

export const storyCardClass =
  'relative flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-panel p-6 sm:w-[60%] sm:p-7 lg:w-auto';

export const storyLinkClass =
  'cursor-pointer transition hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none';

export function StorySegments({ index, tone }: { index: number; tone: 'hero' | 'story' }) {
  return (
    <div aria-hidden className='flex gap-1.5'>
      {Array.from({ length: STORY_COUNT }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full',
            i <= index ? 'bg-current' : tone === 'hero' ? 'bg-current/30' : 'bg-current/15',
          )}
        />
      ))}
    </div>
  );
}

export function StoryKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className='mt-5 text-xs font-extrabold tracking-[0.14em] text-current/75 uppercase'>
      {children}
    </p>
  );
}
