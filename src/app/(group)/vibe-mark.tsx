import { cn } from '@/lib/utils';
import type { Vibe } from '@/stats/vibe';
import { Equal, Sprout, TrendingUp } from 'lucide-react';

export function VibeMark({ vibe }: { vibe: Vibe }) {
  const icon = 'size-3.5 shrink-0';
  switch (vibe.kind) {
    case 'leader':
      return <span aria-hidden>👑</span>;
    case 'streak':
      return <span aria-hidden>🔥</span>;
    case 'night-winner':
      return <span aria-hidden>🏆</span>;
    case 'in-the-green':
      return <TrendingUp aria-hidden className={cn(icon, 'text-win')} strokeWidth={2.5} />;
    case 'even':
      return <Equal aria-hidden className={icon} strokeWidth={2.5} />;
    case 'comeback':
      return <Sprout aria-hidden className={icon} strokeWidth={2.5} />;
  }
}

export function vibeLabel(vibe: Vibe): string {
  switch (vibe.kind) {
    case 'leader':
      return 'Top of the table';
    case 'streak':
      return `${vibe.count} up in a row`;
    case 'night-winner':
      return `${vibe.count}× night winner`;
    case 'in-the-green':
      return 'In the green';
    case 'even':
      return 'Dead even';
    case 'comeback':
      return 'Comeback era';
  }
}
