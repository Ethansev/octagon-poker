import { formatDollars } from '@/money/money';
import { formatShortNightDate } from '@/nights/dates';
import type { PayoutReminder } from '@/nights/payout-reminders';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { ArrowRight, Landmark } from 'lucide-react';
import Link from 'next/link';

function people(count: number): string {
  return count === 1 ? '1 person' : `${count} people`;
}

function copy(reminder: PayoutReminder): { title: string; body: string; cta: string } {
  const where = `${reminder.location ?? 'Poker night'} · ${formatShortNightDate(reminder.date)}`;
  switch (reminder.kind) {
    case 'owed-you':
      return {
        title: `${firstName(reminder.bank.name)} owes you ${formatDollars(reminder.cents)}`,
        body: `${where}. It clears once the bank marks you paid.`,
        cta: 'See the pay-outs',
      };
    case 'you-owe':
      return {
        title: `You owe ${people(reminder.count)} ${formatDollars(reminder.cents)}`,
        body: `You held the bank at ${where}. Mark each one paid as you send it.`,
        cta: 'Pay out',
      };
    case 'bank-owes':
      return {
        title: `${firstName(reminder.bank.name)} still owes ${people(reminder.count)} ${formatDollars(reminder.cents)}`,
        body: where,
        cta: 'See the pay-outs',
      };
  }
}

export function PayoutReminders({ reminders }: { reminders: PayoutReminder[] }) {
  if (reminders.length === 0) return null;

  return (
    <ul className='space-y-3'>
      {reminders.map((reminder) => {
        const text = copy(reminder);
        return (
          <li key={reminder.nightId}>
            <Link
              href={`/nights/${reminder.nightId}`}
              className='group flex cursor-pointer flex-col gap-4 rounded-panel bg-surface p-5 text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:flex-row sm:items-center sm:p-6'>
              <div className='flex flex-1 items-start gap-4 sm:items-center'>
                {reminder.kind === 'you-owe' ? (
                  <span
                    aria-hidden
                    className='grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-3 text-ink sm:size-14'>
                    <Landmark className='size-6 sm:size-7' />
                  </span>
                ) : (
                  <PlayerAvatar
                    colorSlot={reminder.bank.colorSlot}
                    name={reminder.bank.name}
                    size={52}
                    className='shrink-0'
                  />
                )}
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-extrabold tracking-[0.14em] text-ink-2 uppercase'>
                    Pay-out
                  </p>
                  <p className='mt-1 text-2xl leading-tight font-bold tracking-tight tabular-nums sm:text-3xl'>
                    {text.title}
                  </p>
                  <p className='mt-1 text-sm font-semibold text-ink-2'>{text.body}</p>
                </div>
              </div>
              <span className='inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-surface-3 px-5 text-sm font-extrabold transition group-hover:gap-3 group-hover:bg-ink group-hover:text-surface motion-reduce:transition-none'>
                {text.cta} <ArrowRight aria-hidden className='size-4' />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
