import type { ReactNode } from 'react';

type AwardCardProps = { title: string; winner: string; detail: ReactNode };

export function AwardCard({ title, winner, detail }: AwardCardProps) {
  return (
    <div className='rounded-2xl bg-surface px-3 py-2.5 shadow-card'>
      <div className='text-[10px] font-semibold tracking-wider text-ink-2 uppercase'>{title}</div>
      <div className='text-base font-bold text-ink'>{winner}</div>
      <div className='text-xs text-ink-2'>{detail}</div>
    </div>
  );
}
