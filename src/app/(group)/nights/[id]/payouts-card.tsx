'use client';

import { cn } from '@/lib/utils';
import { formatDollars } from '@/money/money';
import { markPaidAction } from '@/nights/actions';
import type { Payout, PayoutPlan } from '@/nights/payouts';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { Check, Landmark } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

function usePayoutToggle(nightId: string, payouts: Payout[]) {
  const [, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(
    payouts,
    (current, change: { playerId: string; paid: boolean }) =>
      current.map((payout) =>
        payout.playerId === change.playerId ? { ...payout, paid: change.paid } : payout,
      ),
  );

  function toggle(payout: Payout) {
    const paid = !payout.paid;
    startTransition(async () => {
      setShown({ playerId: payout.playerId, paid });
      const result = await markPaidAction({ nightId, playerId: payout.playerId, paid });
      if (result.kind === 'nothing-owed') toast.error('Nothing is owed to them.');
      if (result.kind === 'night-open') toast.error('Close the night before paying out.');
      if (result.kind === 'not-found') toast.error('Night not found.');
    });
  }

  return { shown, toggle };
}

function headline(bankName: string, payouts: Payout[]): string {
  if (payouts.length === 0) return `Nobody’s owed a thing`;
  const left = payouts.filter((payout) => !payout.paid);
  if (left.length === 0) return `${bankName} paid everyone out`;
  const cents = left.reduce((sum, payout) => sum + payout.cents, 0);
  return `${bankName} owes ${formatDollars(cents)}`;
}

export function PayoutsCard({ nightId, plan }: { nightId: string; plan: PayoutPlan }) {
  const { shown, toggle } = usePayoutToggle(nightId, plan.payouts);
  const bankName = firstName(plan.bank.name);
  const paidCount = shown.filter((payout) => payout.paid).length;

  return (
    <section
      aria-labelledby='payouts-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <p className='inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase'>
        <Landmark aria-hidden className='size-3.5' strokeWidth={2.5} />
        Pay-outs
      </p>
      <h2
        id='payouts-heading'
        className='mt-2 text-3xl leading-none font-bold tracking-tight tabular-nums'>
        {headline(bankName, shown)}
      </h2>
      <p className='mt-2 flex items-center gap-2 text-sm font-semibold text-ink-2'>
        <PlayerAvatar colorSlot={plan.bank.colorSlot} name={plan.bank.name} size={22} />
        <span>
          {bankName} held the bank
          {shown.length > 0 && (
            <>
              {' '}
              · {paidCount} of {shown.length} paid
            </>
          )}
        </span>
      </p>

      {shown.length > 0 && (
        <ul className='mt-5 space-y-2'>
          {shown.map((payout) => (
            <li
              key={payout.playerId}
              className={cn(
                'flex items-center gap-3 rounded-3xl p-2 pl-3 transition-colors motion-reduce:transition-none',
                payout.paid ? 'bg-surface-2' : 'bg-surface-3',
              )}>
              <PlayerAvatar
                colorSlot={payout.colorSlot}
                name={payout.name}
                size={36}
                tone={payout.paid ? 'muted' : 'solid'}
              />
              <span className='min-w-0 flex-1'>
                <span className={cn('block truncate font-extrabold', payout.paid && 'text-ink-2')}>
                  {payout.name}
                </span>
                <span className='block text-sm font-bold text-ink-2 tabular-nums'>
                  {payout.paid ? 'Paid ' : 'Gets '}
                  {formatDollars(payout.cents)}
                </span>
              </span>
              <button
                type='button'
                onClick={() => toggle(payout)}
                className={cn(
                  'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-extrabold transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none',
                  payout.paid
                    ? 'bg-surface text-win shadow-card hover:text-ink-2'
                    : 'bg-primary text-primary-ink hover:bg-primary-hover',
                )}>
                {payout.paid ? (
                  <>
                    <Check aria-hidden className='size-4' strokeWidth={3} /> Paid
                    <span className='sr-only'>, undo for {payout.name}</span>
                  </>
                ) : (
                  <>
                    Mark paid<span className='sr-only'> for {payout.name}</span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {plan.bank.keepsCents > 0 && (
        <p className='mt-4 text-sm font-semibold text-ink-2'>
          {bankName} keeps their own{' '}
          <span className='tabular-nums'>{formatDollars(plan.bank.keepsCents)}</span>.
        </p>
      )}
    </section>
  );
}
