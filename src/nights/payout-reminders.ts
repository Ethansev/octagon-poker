import type { OutstandingNight } from '@/nights/nights';

type ReminderNight = { nightId: string; date: string; location: string | null };
type Bank = OutstandingNight['bank'];

export type PayoutReminder =
  | (ReminderNight & { kind: 'owed-you'; bank: Bank; cents: number })
  | (ReminderNight & { kind: 'you-owe'; count: number; cents: number })
  | (ReminderNight & { kind: 'bank-owes'; bank: Bank; count: number; cents: number });

export function payoutReminders(
  outstanding: OutstandingNight[],
  viewerPlayerId: string | null,
): PayoutReminder[] {
  return outstanding.flatMap((night): PayoutReminder[] => {
    const at = { nightId: night.nightId, date: night.date, location: night.location };
    const count = night.payouts.length;
    const cents = night.payouts.reduce((sum, payout) => sum + payout.cents, 0);
    if (viewerPlayerId === null)
      return [{ kind: 'bank-owes', ...at, bank: night.bank, count, cents }];
    if (night.bank.playerId === viewerPlayerId) return [{ kind: 'you-owe', ...at, count, cents }];
    const mine = night.payouts.find((payout) => payout.playerId === viewerPlayerId);
    return mine ? [{ kind: 'owed-you', ...at, bank: night.bank, cents: mine.cents }] : [];
  });
}
