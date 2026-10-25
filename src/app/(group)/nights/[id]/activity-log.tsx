import { dateInGroup, timeInGroup } from '@/dates/group-time';
import { env } from '@/env';
import { formatDollars } from '@/money/money';
import type { NightEventView } from '@/nights/nights';
import { z } from 'zod';

const centsSchema = z.object({ buyInCents: z.number(), cashOutCents: z.number().nullable() });
const seatDetailSchema = z.object({
  playerId: z.string(),
  before: centsSchema.nullable(),
  after: centsSchema.nullable(),
});

function actorLabel(event: NightEventView): string {
  if (event.actorKind === 'owner') return 'Host';
  return event.actorName ?? 'Someone with the link';
}

function money(cents: number | null): string {
  return cents === null ? '—' : formatDollars(cents);
}

function formatEventTime(createdAt: Date, nightDate: string): string {
  const time = timeInGroup(createdAt);
  if (dateInGroup(createdAt) === nightDate) return time;
  const day = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: env.GROUP_TIME_ZONE,
  });
  return `${day}, ${time}`;
}

function changes(before: z.infer<typeof centsSchema>, after: z.infer<typeof centsSchema>): string {
  const parts: string[] = [];
  if (before.buyInCents !== after.buyInCents) {
    parts.push(`buy-in ${money(before.buyInCents)} → ${money(after.buyInCents)}`);
  }
  if (before.cashOutCents !== after.cashOutCents) {
    parts.push(`cash-out ${money(before.cashOutCents)} → ${money(after.cashOutCents)}`);
  }
  return parts.join(', ');
}

function describe(event: NightEventView, names: Map<string, string>): string {
  const actor = actorLabel(event);
  const seat = seatDetailSchema.safeParse(event.detail);
  const target = seat.success ? (names.get(seat.data.playerId) ?? 'a player') : 'a player';

  switch (event.action) {
    case 'night.create':
      return `${actor} logged the night`;
    case 'night.update':
      return `${actor} edited the night details`;
    case 'night.close':
      return `${actor} closed the night`;
    case 'night.reopen':
      return `${actor} reopened the night`;
    case 'seat.add':
      return seat.success && seat.data.after
        ? `${actor} added ${target} (${money(seat.data.after.buyInCents)} in)`
        : `${actor} added ${target}`;
    case 'seat.remove':
      return `${actor} removed ${target}`;
    case 'seat.update': {
      if (!seat.success || !seat.data.before || !seat.data.after)
        return `${actor} updated ${target}`;
      const detail = changes(seat.data.before, seat.data.after);
      return detail === '' ? `${actor} updated ${target}` : `${actor} updated ${target}: ${detail}`;
    }
    default:
      return `${actor} made a change`;
  }
}

export function ActivityLog({
  events,
  nightDate,
  names,
}: {
  events: NightEventView[];
  nightDate: string;
  names: Map<string, string>;
}) {
  return (
    <details className='group'>
      <summary className='cursor-pointer text-[10px] font-semibold tracking-wider text-ink-2 uppercase'>
        Activity ({events.length})
      </summary>
      <ul className='mt-2 space-y-1.5 text-sm text-ink-2'>
        {events.map((event) => (
          <li key={event.id}>
            <span className='text-ink-3'>{formatEventTime(event.createdAt, nightDate)} · </span>
            {describe(event, names)}
          </li>
        ))}
      </ul>
    </details>
  );
}
