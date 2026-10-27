import { formatDollars } from '@/money/money';
import type { NightEventView } from '@/nights/nights';
import { z } from 'zod';

const centsSchema = z.object({ buyInCents: z.number(), cashOutCents: z.number().nullable() });
const bankDetailSchema = z.object({ before: z.string().nullable(), after: z.string() });
const paidDetailSchema = z.object({ playerId: z.string(), cents: z.number() });
const seatDetailSchema = z.object({
  playerId: z.string(),
  before: centsSchema.nullable(),
  after: centsSchema.nullable(),
});

type Cents = z.infer<typeof centsSchema>;

export type NightMark = 'start' | 'edit' | 'close' | 'reopen' | 'bank' | 'other';

export type FeedLine =
  | { kind: 'night'; mark: NightMark; text: string }
  | { kind: 'seat'; playerId: string; text: string; by: string | null };

function actorLabel(event: NightEventView): string {
  if (event.actorKind === 'owner') return 'The host';
  return event.actorName ?? 'Someone with the link';
}

function byLabel(event: NightEventView, target: string): string | null {
  if (event.actorKind === 'owner') return 'the host';
  if (event.actorName === target) return null;
  return event.actorName ?? 'someone with the link';
}

function paidLine(event: NightEventView, names: Map<string, string>): FeedLine | null {
  const paid = paidDetailSchema.safeParse(event.detail);
  if (!paid.success) return null;
  const target = names.get(paid.data.playerId) ?? 'A player';
  const amount = formatDollars(paid.data.cents);
  return {
    kind: 'seat',
    playerId: paid.data.playerId,
    text:
      event.action === 'seat.paid'
        ? `${target} got paid ${amount}`
        : `${target}’s ${amount} pay-out was marked unpaid`,
    by: byLabel(event, target),
  };
}

function bankLine(event: NightEventView, names: Map<string, string>): FeedLine {
  const bank = bankDetailSchema.safeParse(event.detail);
  if (!bank.success) return { kind: 'night', mark: 'bank', text: 'The bank changed hands' };
  const after = names.get(bank.data.after) ?? 'Someone';
  const before = bank.data.before === null ? null : (names.get(bank.data.before) ?? 'someone');
  return {
    kind: 'night',
    mark: 'bank',
    text:
      before === null
        ? `${after} is holding the bank`
        : `${after} took over the bank from ${before}`,
  };
}

function seatChange(target: string, before: Cents, after: Cents): string {
  const buyInMoved = before.buyInCents !== after.buyInCents;
  const cashOutMoved = before.cashOutCents !== after.cashOutCents;
  const outAfter = after.cashOutCents;

  if (buyInMoved && cashOutMoved) {
    return outAfter === null
      ? `${target} is back in for ${formatDollars(after.buyInCents)}`
      : `${target} is now ${formatDollars(after.buyInCents)} in, ${formatDollars(outAfter)} out`;
  }
  if (cashOutMoved) {
    if (outAfter === null) return `${target} is back at the table`;
    if (before.cashOutCents === null) return `${target} cashed out ${formatDollars(outAfter)}`;
    return `${target}'s cash-out changed: ${formatDollars(before.cashOutCents)} → ${formatDollars(outAfter)}`;
  }
  if (buyInMoved) {
    return after.buyInCents > before.buyInCents
      ? `${target} rebought, now in for ${formatDollars(after.buyInCents)}`
      : `${target}'s buy-in changed: ${formatDollars(before.buyInCents)} → ${formatDollars(after.buyInCents)}`;
  }
  return `${target} kept the same numbers`;
}

export function feedLine(event: NightEventView, names: Map<string, string>): FeedLine {
  const actor = actorLabel(event);
  switch (event.action) {
    case 'night.create':
      return { kind: 'night', mark: 'start', text: `${actor} started the night` };
    case 'night.update':
      return { kind: 'night', mark: 'edit', text: `${actor} edited the night details` };
    case 'night.close':
      return { kind: 'night', mark: 'close', text: `${actor} closed the books` };
    case 'night.reopen':
      return { kind: 'night', mark: 'reopen', text: `${actor} reopened the night` };
    case 'night.bank':
      return bankLine(event, names);
    case 'seat.paid':
    case 'seat.unpaid': {
      const line = paidLine(event, names);
      if (line) return line;
    }
  }

  const seat = seatDetailSchema.safeParse(event.detail);
  if (!seat.success) return { kind: 'night', mark: 'other', text: `${actor} made a change` };

  const { playerId, before, after } = seat.data;
  const target = names.get(playerId) ?? 'A player';
  const by = byLabel(event, target);
  const line = (text: string): FeedLine => ({ kind: 'seat', playerId, text, by });

  switch (event.action) {
    case 'seat.add':
      return line(
        after ? `${target} sat down with ${formatDollars(after.buyInCents)}` : `${target} sat down`,
      );
    case 'seat.remove':
      return line(`${target} left the table`);
    case 'seat.update':
      return line(before && after ? seatChange(target, before, after) : `${target} was updated`);
    default:
      return line(`${actor} changed ${target}'s seat`);
  }
}
