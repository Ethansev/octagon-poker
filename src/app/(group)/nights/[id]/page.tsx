import { getViewer } from '@/access/viewer';
import { ActivityLog } from '@/app/(group)/nights/[id]/activity-log';
import { NightOwnerActions } from '@/app/(group)/nights/[id]/night-owner-actions';
import { closeBlockedReason, NightTotals } from '@/app/(group)/nights/[id]/night-totals';
import { centsToInput, toSeatData } from '@/app/(group)/nights/[id]/seat-data';
import { SeatTable } from '@/app/(group)/nights/[id]/seat-table';
import { WhoAreYou } from '@/app/(group)/nights/[id]/who-are-you';
import { formatDollars, formatNet } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { getNight } from '@/nights/nights';
import { listPlayers } from '@/players/players';
import { seatNet } from '@/stats/nights';
import { notFound } from 'next/navigation';
import { z } from 'zod';

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export default async function NightPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const night = await getNight(viewer.group.id, id.data);
  if (!night) notFound();

  const players = await listPlayers(viewer.group.id);
  const names = new Map(players.map((player) => [player.id, player.name]));
  const winnerSeats = night.seats.filter((seat) => night.winners.includes(seat.playerId));
  const winnerNet =
    winnerSeats.length > 0
      ? seatNet({
          playerId: winnerSeats[0].playerId,
          buyInCents: winnerSeats[0].buyInCents,
          cashOutCents: winnerSeats[0].cashOutCents ?? 0,
        })
      : 0;
  const closed = night.status === 'closed';

  return (
    <div className='mx-auto max-w-3xl space-y-5 p-4 pt-6'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-extrabold text-slate-900'>{formatNightDate(night.date)}</h1>
          <p className='mt-0.5 text-xs text-slate-500'>
            {[
              night.location,
              night.buyInCents === null ? null : `${formatDollars(night.buyInCents)} buy-in`,
            ]
              .filter((part) => part !== null)
              .join(' · ') || 'No location or buy-in set'}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs ${
            closed
              ? 'border-slate-200 text-slate-600'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}>
          {closed ? 'Closed' : 'Open'}
        </span>
      </div>

      {viewer.role === 'member' && viewer.playerId === null && <WhoAreYou players={players} />}

      {closed && (
        <div className='rounded-xl bg-slate-900 px-3 py-2.5 text-white'>
          <div className='text-[10px] font-semibold tracking-wider text-slate-400 uppercase'>
            Winner
          </div>
          <div className='text-base font-bold'>
            {winnerSeats.length === 0 ? (
              'No winner. Nobody finished up.'
            ) : (
              <>
                {joinNames(winnerSeats.map((seat) => seat.playerName))} took it{' '}
                <span className='text-green-400'>{formatNet(winnerNet)}</span>
              </>
            )}
          </div>
        </div>
      )}

      <NightTotals seats={night.seats} />

      <section>
        <h2 className='mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
          Players
        </h2>
        <SeatTable
          nightId={night.id}
          typicalBuyInCents={night.buyInCents}
          seats={night.seats.map(toSeatData)}
          players={players}
          readOnly={closed}
        />
      </section>

      {viewer.role === 'owner' && (
        <NightOwnerActions
          nightId={night.id}
          status={night.status}
          closeBlockedReason={closeBlockedReason(night.seats)}
          details={{
            date: night.date,
            location: night.location ?? '',
            buyIn: centsToInput(night.buyInCents),
          }}
        />
      )}

      <ActivityLog events={night.events} nightDate={night.date} names={names} />
    </div>
  );
}
