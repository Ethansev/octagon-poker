import { getViewer } from '@/access/viewer';
import { BackLink } from '@/app/(group)/back-link';
import { InviteReply } from '@/app/(group)/nights/[id]/invite-reply';
import { formatShortNightDate } from '@/nights/dates';
import { listRsvps, nightDetailsLabel, seesNightDetails } from '@/nights/invites';
import { getNight } from '@/nights/nights';
import { Lock, Navigation } from 'lucide-react';
import { notFound } from 'next/navigation';
import { z } from 'zod';

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default async function NightLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const [night, rsvps] = await Promise.all([
    getNight(viewer.group.id, id.data),
    listRsvps(id.data),
  ]);
  const label = night && nightDetailsLabel(night);
  if (!night || !label) notFound();

  const current = rsvps.find((rsvp) => rsvp.playerId === viewer.playerId)?.response ?? null;
  const unlocked = seesNightDetails(viewer, rsvps);
  const canReply = viewer.playerId !== null && night.status === 'open';

  return (
    <div className='mx-auto max-w-[720px] px-4 pt-5 pb-20 sm:px-6 lg:pt-8'>
      <BackLink href={`/nights/${night.id}?view=invite`}>Back to the invite</BackLink>
      <section className='mt-5 rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-10'>
        <p className='text-xs font-extrabold tracking-[0.14em] text-hero-muted uppercase'>
          {label} · {formatShortNightDate(night.date)}
        </p>
        <h1 className='mt-3 text-4xl leading-tight font-bold tracking-tight break-words sm:text-5xl'>
          {night.location ?? 'Where we’re playing'}
        </h1>

        {unlocked ? (
          <>
            {night.address && (
              <>
                <p className='mt-6 text-xl font-bold break-words'>{night.address}</p>
                <a
                  href={mapsUrl(night.address)}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-4 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-ink transition hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
                  <Navigation aria-hidden className='size-4' /> Directions
                </a>
              </>
            )}
            {night.notes && (
              <div className='mt-7 border-t border-current/15 pt-5'>
                <h2 className='text-xs font-extrabold tracking-[0.14em] text-hero-muted uppercase'>
                  Notes for guests
                </h2>
                <p className='mt-2 text-lg font-semibold break-words'>{night.notes}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className='mt-6 flex items-center gap-2 font-semibold text-hero-muted'>
              <Lock aria-hidden className='size-4 shrink-0' />
              Say you’re in to see the details.
            </p>
            {canReply && (
              <div className='mt-5'>
                <InviteReply nightId={night.id} current={current} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
