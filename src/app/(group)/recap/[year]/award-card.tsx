import type { ReactNode } from 'react';

type AwardCardProps = { title: string; winner: string; detail: ReactNode };

export function AwardCard({ title, winner, detail }: AwardCardProps) {
  return (
    <div className='rounded-xl border border-slate-200 px-3 py-2.5'>
      <div className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
        {title}
      </div>
      <div className='text-base font-bold text-slate-900'>{winner}</div>
      <div className='text-xs text-slate-500'>{detail}</div>
    </div>
  );
}
