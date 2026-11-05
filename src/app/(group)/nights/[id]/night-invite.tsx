import type { Viewer } from '@/access/viewer';
import { CommentComposer, DeleteCommentButton } from '@/app/(group)/nights/[id]/invite-comments';
import { InviteReply } from '@/app/(group)/nights/[id]/invite-reply';
import { formatEventTime } from '@/app/(group)/nights/[id]/night-feed';
import { NightTable, TABLE_SEATS } from '@/app/(group)/nights/[id]/night-table';
import { NotYouButton } from '@/app/(group)/nights/[id]/not-you-button';
import { quickAddOrder } from '@/app/(group)/nights/[id]/quick-add-order';
import { QuickAddTile } from '@/app/(group)/nights/[id]/quick-add-tile';
import { WhoAreYou } from '@/app/(group)/nights/[id]/who-are-you';
import { OctagonMark } from '@/components/octagon-mark';
import { todayInGroup } from '@/dates/group-time';
import { formatDollars } from '@/money/money';
import { formatNightTime, formatShortNightDate, nightCountdown } from '@/nights/dates';
import { nightDetailsLabel, type NightComment, type NightRsvp } from '@/nights/invites';
import type { NightPhase } from '@/nights/night-phase';
import type { NightDetail } from '@/nights/nights';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import type { Player } from '@/players/players';
import { CalendarPlus, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';

const heroChip =
  'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-hero-chip-muted px-4 text-sm font-extrabold ring-1 ring-current/20 transition hover:ring-current/50 focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none';

const panel = 'rounded-panel bg-surface p-5 shadow-card sm:p-7';

type NightInviteProps = {
  viewer: Viewer;
  night: NightDetail;
  phase: NightPhase;
  players: Player[];
  rsvps: NightRsvp[];
  comments: NightComment[];
  recentPlayerIds: string[];
};

function whenAndWhere(night: NightDetail): string | null {
  const time = night.startTime === null ? null : formatNightTime(night.startTime);
  if (time && night.location) return `${time} at ${night.location}`;
  return time ?? night.location;
}

function names(rsvps: NightRsvp[]): string {
  return rsvps.map((rsvp) => firstName(rsvp.name)).join(', ');
}

function ReplyArea({
  viewer,
  night,
  phase,
  me,
  current,
}: {
  viewer: Viewer;
  night: NightDetail;
  phase: NightPhase;
  me: Player | undefined;
  current: NightRsvp['response'] | null;
}) {
  if (phase === 'closed') return null;
  if (!me) {
    return (
      <p className='mt-7 text-sm font-semibold text-hero-muted'>
        {viewer.role === 'owner' ? (
          <>
            To reply, tap “This is me” on your card in{' '}
            <Link href='/players' className='font-bold underline underline-offset-2'>
              Players
            </Link>
            .
          </>
        ) : (
          'Pick your name below to reply.'
        )}
      </p>
    );
  }
  return (
    <div className='mt-7'>
      <InviteReply nightId={night.id} current={current} />
      {viewer.role === 'member' && (
        <p className='mt-2.5 text-sm font-semibold text-hero-muted'>
          Replying as {firstName(me.name)} · <NotYouButton />
        </p>
      )}
    </div>
  );
}

function WhosIn({ rsvps, addPlayers }: { rsvps: NightRsvp[]; addPlayers: React.ReactNode }) {
  const going = rsvps.filter((rsvp) => rsvp.response === 'going');
  const maybe = rsvps.filter((rsvp) => rsvp.response === 'maybe');
  const out = rsvps.filter((rsvp) => rsvp.response === 'out');

  return (
    <section aria-labelledby='whos-in-heading' className={`${panel} lg:col-span-5`}>
      <div className='flex items-center justify-between gap-3'>
        <h2 id='whos-in-heading' className='text-2xl font-bold tracking-tight'>
          {going.length === 0
            ? 'Nobody’s in yet'
            : `${going.length} ${going.length === 1 ? 'is' : 'are'} in`}
        </h2>
        {addPlayers}
      </div>
      {going.length > TABLE_SEATS && (
        <p className='mt-0.5 text-sm font-semibold text-ink-2'>
          {TABLE_SEATS} at the table at a time. Everyone else rotates in.
        </p>
      )}
      {going.length > 0 && (
        <ul className='mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5'>
          {going.map((rsvp) => (
            <li key={rsvp.playerId} className='flex min-w-0 items-center gap-2.5 font-extrabold'>
              <PlayerAvatar colorSlot={rsvp.colorSlot} name={rsvp.name} size={32} />
              <span className='truncate'>{firstName(rsvp.name)}</span>
            </li>
          ))}
        </ul>
      )}
      {(maybe.length > 0 || out.length > 0) && (
        <p className='mt-4 border-t border-line pt-3 text-sm font-semibold text-ink-2'>
          {maybe.length > 0 && `Maybe: ${names(maybe)}`}
          {maybe.length > 0 && out.length > 0 && ' · '}
          {out.length > 0 && `Can’t: ${names(out)}`}
        </p>
      )}
    </section>
  );
}

function Comment({
  comment,
  nightId,
  nightDate,
  canDelete,
}: {
  comment: NightComment;
  nightId: string;
  nightDate: string;
  canDelete: boolean;
}) {
  return (
    <li className='flex gap-3'>
      {comment.name !== null && comment.colorSlot !== null ? (
        <PlayerAvatar colorSlot={comment.colorSlot} name={comment.name} size={36} />
      ) : (
        <OctagonMark className='size-9 shrink-0' />
      )}
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-extrabold'>
          {comment.name === null ? 'The host' : firstName(comment.name)}{' '}
          <span className='font-semibold text-ink-3'>
            {formatEventTime(comment.createdAt, nightDate)}
          </span>
        </p>
        <p className='mt-0.5 text-[15px] font-medium break-words'>{comment.body}</p>
      </div>
      {canDelete && <DeleteCommentButton nightId={nightId} commentId={comment.id} />}
    </li>
  );
}

export function NightInvite({
  viewer,
  night,
  phase,
  players,
  rsvps,
  comments,
  recentPlayerIds,
}: NightInviteProps) {
  const me = players.find((player) => player.id === viewer.playerId);
  const host = players.find((player) => player.id === viewer.group.ownerPlayerId);
  const current = rsvps.find((rsvp) => rsvp.playerId === viewer.playerId)?.response ?? null;
  const going = rsvps.filter((rsvp) => rsvp.response === 'going');
  const detailsLabel = nightDetailsLabel(night);
  const countdown = phase === 'upcoming' ? nightCountdown(night.date, todayInGroup()) : null;
  const headline = whenAndWhere(night);
  const facts = [
    night.buyInCents === null ? null : `${formatDollars(night.buyInCents)} buy-in`,
    host ? `Hosted by ${firstName(host.name)}` : null,
  ].filter((fact) => fact !== null);
  const needsName = viewer.role === 'member' && !me && phase !== 'closed';
  const alreadyIn = new Set([
    ...going.map((rsvp) => rsvp.playerId),
    ...night.seats.map((seat) => seat.playerId),
  ]);

  return (
    <div className='mt-6 space-y-6 lg:space-y-8'>
      <section className='overflow-hidden rounded-panel bg-hero text-hero-ink shadow-hero'>
        <div className='grid lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]'>
          <div className='min-w-0 p-6 sm:p-10'>
            <p className='text-xs font-extrabold tracking-[0.14em] text-hero-muted uppercase'>
              {countdown ? `You’re invited · ${countdown}` : 'Poker night'}
            </p>
            <h1 className='mt-3 text-6xl leading-[0.95] font-bold tracking-tight sm:text-7xl'>
              {formatShortNightDate(night.date)}
            </h1>
            {headline && (
              <p className='mt-3 text-3xl leading-tight font-bold tracking-tight break-words'>
                {headline}
              </p>
            )}
            {facts.length > 0 && (
              <p className='mt-3 text-base font-semibold text-hero-muted'>{facts.join(' · ')}</p>
            )}
            <div className='mt-4 flex flex-wrap gap-2'>
              {detailsLabel && (
                <Link href={`/nights/${night.id}/location`} className={heroChip}>
                  <MapPin aria-hidden className='size-4' /> {detailsLabel}
                </Link>
              )}
              {phase === 'upcoming' && (
                <a href={`/nights/${night.id}/calendar`} className={heroChip}>
                  <CalendarPlus aria-hidden className='size-4' /> Add to calendar
                </a>
              )}
            </div>
            <ReplyArea viewer={viewer} night={night} phase={phase} me={me} current={current} />
          </div>
          <div className='relative min-h-[320px] overflow-hidden'>
            <NightTable going={going} />
          </div>
        </div>
      </section>

      {needsName && <WhoAreYou players={players} />}

      <div className='grid items-start gap-6 lg:grid-cols-12 lg:gap-8'>
        <WhosIn
          rsvps={rsvps}
          addPlayers={
            viewer.role === 'owner' &&
            phase !== 'closed' &&
            night.buyInCents !== null && (
              <QuickAddTile
                nightId={night.id}
                buyInCents={night.buyInCents}
                available={quickAddOrder(
                  players.filter((player) => !alreadyIn.has(player.id)),
                  recentPlayerIds,
                )}
                allNames={players.map((player) => player.name)}
                trigger={
                  <button
                    type='button'
                    className='inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-surface-3 px-4 text-sm font-extrabold transition hover:bg-ink hover:text-surface focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none'>
                    <Plus aria-hidden className='size-4' strokeWidth={3} /> Add player
                  </button>
                }
              />
            )
          }
        />

        <section aria-labelledby='comments-heading' className={`${panel} min-w-0 lg:col-span-7`}>
          <h2 id='comments-heading' className='text-2xl font-bold tracking-tight'>
            Comments
          </h2>
          {comments.length === 0 ? (
            <p className='mt-2 text-sm font-semibold text-ink-2'>
              No comments yet. Say hi, or ask what to bring.
            </p>
          ) : (
            <ul className='mt-4 space-y-4'>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  nightId={night.id}
                  nightDate={night.date}
                  canDelete={
                    viewer.role === 'owner' ||
                    (comment.playerId !== null && comment.playerId === viewer.playerId)
                  }
                />
              ))}
            </ul>
          )}
          <div className='mt-5 flex items-center gap-3 border-t border-line pt-5'>
            {needsName ? (
              <p className='text-sm font-semibold text-ink-2'>Pick your name above to comment.</p>
            ) : (
              <>
                {me && <PlayerAvatar colorSlot={me.colorSlot} name={me.name} size={36} />}
                <CommentComposer nightId={night.id} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
