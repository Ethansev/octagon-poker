import { requireOwner } from '@/access/viewer';
import { ContactDialog } from '@/app/(group)/players/contact-dialog';
import { contactStats, type ContactStats } from '@/app/(group)/players/contact-stats';
import { HostToggle } from '@/app/(group)/players/host-toggle';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { listClosedNights } from '@/nights/nights';
import { PlayerAvatar } from '@/players/player-avatar';
import { listContacts, type Contact } from '@/players/players';
import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs font-bold text-ink-2'>{label}</dt>
      <dd className='mt-0.5 text-lg font-bold tabular-nums'>{value}</dd>
    </div>
  );
}

function HandleRow({ service, value }: { service: string; value: string | null }) {
  return (
    <div className='flex min-w-0 items-baseline gap-2 text-sm'>
      <dt className='w-12 shrink-0 font-bold text-ink-2'>{service}</dt>
      <dd className={cn('truncate font-semibold', value === null && 'text-ink-3')}>
        {value ?? 'Not added'}
      </dd>
    </div>
  );
}

function ContactCard({
  contact,
  stats,
  hostPlayerId,
}: {
  contact: Contact;
  stats: ContactStats;
  hostPlayerId: string | null;
}) {
  const isHost = contact.id === hostPlayerId;
  return (
    <li className='flex min-w-0 flex-col gap-4 rounded-panel bg-surface p-5 shadow-card'>
      <div className='flex items-center gap-3'>
        <PlayerAvatar colorSlot={contact.colorSlot} name={contact.name} size={48} />
        <div className='min-w-0 flex-1'>
          <Link
            href={`/players/${contact.id}`}
            className='block truncate text-xl leading-tight font-bold tracking-tight hover:underline'>
            {contact.name}
          </Link>
          <p
            className={cn(
              'text-sm font-extrabold tabular-nums',
              stats.netCents > 0 && 'text-win',
              stats.netCents < 0 && 'text-loss',
              stats.netCents === 0 && 'text-ink-2',
            )}>
            {stats.nightsPlayed === 0 ? 'No nights yet' : `${formatNet(stats.netCents)} all time`}
          </p>
        </div>
        <ContactDialog
          contact={contact}
          trigger={
            <button
              type='button'
              aria-label={`Edit ${contact.name}`}
              title={`Edit ${contact.name}`}
              className='inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line text-ink-2 transition hover:bg-surface-2 hover:text-ink focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
              <Pencil aria-hidden className='size-4' />
            </button>
          }
        />
      </div>
      <dl className='grid grid-cols-3 gap-3 rounded-2xl bg-surface-2 p-3'>
        <Stat label='Nights' value={String(stats.nightsPlayed)} />
        <Stat label='Won' value={String(stats.nightsWon)} />
        <Stat label='Up / down' value={`${stats.upNights} / ${stats.downNights}`} />
      </dl>
      <div className='flex items-end justify-between gap-3'>
        <dl className='flex min-w-0 flex-col gap-1'>
          <HandleRow service='Venmo' value={contact.venmoHandle} />
          <HandleRow service='Zelle' value={contact.zelleHandle} />
        </dl>
        {(isHost || hostPlayerId === null) && <HostToggle playerId={contact.id} isHost={isHost} />}
      </div>
    </li>
  );
}

export default async function PlayersPage() {
  const viewer = await requireOwner();
  const [contacts, nights] = await Promise.all([
    listContacts(viewer.group.id),
    listClosedNights(viewer.group.id),
  ]);

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-sm font-extrabold tracking-[0.14em] text-ink-2 uppercase'>
            Host tools
          </p>
          <h1 className='mt-1 text-4xl leading-[1.02] font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Players
          </h1>
          <p className='mt-2 max-w-[52ch] text-sm font-semibold text-ink-2'>
            Payment info only shows here and to whoever holds the bank on a closed night.
          </p>
        </div>
        <ContactDialog
          contact={null}
          trigger={
            <button
              type='button'
              className='inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
              <Plus aria-hidden className='size-4' strokeWidth={3} />
              Add player
            </button>
          }
        />
      </div>

      {contacts.length === 0 ? (
        <p className='mt-8 rounded-panel bg-surface p-8 text-center font-semibold text-ink-2 shadow-card'>
          Nobody yet. Add the crew, or they’ll show up here as they join a night.
        </p>
      ) : (
        <ul className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 xl:grid-cols-3'>
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              stats={contactStats(nights, contact.id)}
              hostPlayerId={viewer.playerId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
