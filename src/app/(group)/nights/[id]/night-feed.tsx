import type { FeedLine, NightMark } from '@/app/(group)/nights/[id]/feed-lines';
import { feedLine } from '@/app/(group)/nights/[id]/feed-lines';
import { dateInGroup, timeInGroup } from '@/dates/group-time';
import { env } from '@/env';
import type { NightEventView } from '@/nights/nights';
import { PlayerAvatar } from '@/players/player-avatar';
import type { Player } from '@/players/players';
import { Flag, LockOpen, Pencil, Play, Sparkle } from 'lucide-react';

const SHOWN_EVENTS = 7;

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

function MarkIcon({ mark }: { mark: NightMark }) {
  const icon = 'size-4';
  switch (mark) {
    case 'start':
      return <Play aria-hidden className={icon} />;
    case 'edit':
      return <Pencil aria-hidden className={icon} />;
    case 'close':
      return <Flag aria-hidden className={icon} />;
    case 'reopen':
      return <LockOpen aria-hidden className={icon} />;
    case 'other':
      return <Sparkle aria-hidden className={icon} />;
  }
}

function LineBadge({ line, players }: { line: FeedLine; players: Map<string, Player> }) {
  const player = line.kind === 'seat' ? players.get(line.playerId) : undefined;
  if (player) return <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={32} />;
  return (
    <span className='grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 text-ink-2'>
      <MarkIcon mark={line.kind === 'night' ? line.mark : 'other'} />
    </span>
  );
}

function FeedRow({
  event,
  nightDate,
  names,
  players,
}: {
  event: NightEventView;
  nightDate: string;
  names: Map<string, string>;
  players: Map<string, Player>;
}) {
  const line = feedLine(event, names);
  return (
    <li className='flex items-start gap-3 py-2.5'>
      <LineBadge line={line} players={players} />
      <span className='min-w-0 flex-1 text-sm leading-snug font-bold'>
        {line.text}
        <span className='block text-xs font-semibold text-ink-3 tabular-nums'>
          {formatEventTime(event.createdAt, nightDate)}
          {line.kind === 'seat' && line.by !== null && ` · by ${line.by}`}
        </span>
      </span>
    </li>
  );
}

export function NightFeed({
  events,
  nightDate,
  players,
}: {
  events: NightEventView[];
  nightDate: string;
  players: Player[];
}) {
  const byId = new Map(players.map((player) => [player.id, player]));
  const names = new Map(players.map((player) => [player.id, player.name]));
  const shown = events.slice(0, SHOWN_EVENTS);
  const hidden = events.slice(SHOWN_EVENTS);
  const row = (event: NightEventView) => (
    <FeedRow key={event.id} event={event} nightDate={nightDate} names={names} players={byId} />
  );

  return (
    <section
      aria-labelledby='feed-heading'
      className='rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='feed-heading' className='text-2xl font-bold tracking-tight'>
        Table talk
      </h2>
      <p className='text-sm font-semibold text-ink-2'>Everything that happened, newest first.</p>
      {events.length === 0 ? (
        <p className='mt-4 text-sm font-semibold text-ink-3'>Quiet so far.</p>
      ) : (
        <ul className='mt-3 divide-y divide-line/70'>{shown.map(row)}</ul>
      )}
      {hidden.length > 0 && (
        <details className='group mt-1'>
          <summary className='cursor-pointer list-none rounded-full px-3 py-2 text-center text-sm font-extrabold text-primary transition group-open:hidden hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none [&::-webkit-details-marker]:hidden'>
            Show {hidden.length} more
          </summary>
          <ul className='divide-y divide-line/70 border-t border-line/70'>{hidden.map(row)}</ul>
        </details>
      )}
    </section>
  );
}
