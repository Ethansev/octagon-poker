import { getViewer, type Viewer } from '@/access/viewer';
import { BooksCard } from '@/app/(group)/nights/[id]/books-card';
import { loadNightResults } from '@/app/(group)/nights/[id]/load-night';
import { MoneyFlow } from '@/app/(group)/nights/[id]/money-flow';
import { NightFeed } from '@/app/(group)/nights/[id]/night-feed';
import { NightHeader } from '@/app/(group)/nights/[id]/night-header';
import { NightOwnerActions } from '@/app/(group)/nights/[id]/night-owner-actions';
import { ResultChips } from '@/app/(group)/nights/[id]/result-chips';
import { SeatBoard } from '@/app/(group)/nights/[id]/seat-board';
import { centsToInput, toSeatData } from '@/app/(group)/nights/[id]/seat-data';
import { WhoAreYou } from '@/app/(group)/nights/[id]/who-are-you';
import { WinnerDeck } from '@/app/(group)/nights/[id]/winner-deck';
import { getNight, type NightDetail } from '@/nights/nights';
import { listPlayers, type Player } from '@/players/players';
import { notFound } from 'next/navigation';
import { z } from 'zod';

async function ClosedNight({
  viewer,
  night,
  players,
}: {
  viewer: Viewer;
  night: NightDetail;
  players: Player[];
}) {
  const results = await loadNightResults(viewer.group.id, night);
  return (
    <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
      <div className='space-y-6 lg:col-span-7'>
        <WinnerDeck results={results} />
        <ResultChips seats={results.seats} />
      </div>
      <div className='space-y-6 lg:col-span-5'>
        <MoneyFlow seats={results.seats} potCents={results.potCents} />
        <NightFeed events={night.events} nightDate={night.date} players={players} />
      </div>
    </div>
  );
}

function OpenNight({
  viewer,
  night,
  players,
}: {
  viewer: Viewer;
  night: NightDetail;
  players: Player[];
}) {
  const viewerPlayerId = viewer.role === 'member' ? viewer.playerId : null;
  return (
    <div className='space-y-6'>
      {viewer.role === 'member' && viewer.playerId === null && <WhoAreYou players={players} />}
      <SeatBoard
        nightId={night.id}
        stepCents={night.buyInCents}
        seats={night.seats.map(toSeatData)}
        players={players}
        viewerPlayerId={viewerPlayerId}>
        <BooksCard nightId={night.id} seats={night.seats} canClose={viewer.role === 'owner'} />
        <NightFeed events={night.events} nightDate={night.date} players={players} />
      </SeatBoard>
    </div>
  );
}

export default async function NightPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const [night, players] = await Promise.all([
    getNight(viewer.group.id, id.data),
    listPlayers(viewer.group.id),
  ]);
  if (!night) notFound();

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-5 pb-20 sm:px-6 lg:px-10 lg:pt-8'>
      <NightHeader
        status={night.status}
        date={night.date}
        location={night.location}
        potCents={night.seats.reduce((sum, seat) => sum + seat.buyInCents, 0)}
        playerCount={night.seats.length}
        buyInCents={night.buyInCents}
        actions={
          viewer.role === 'owner' && (
            <NightOwnerActions
              nightId={night.id}
              status={night.status}
              details={{
                date: night.date,
                location: night.location ?? '',
                buyIn: centsToInput(night.buyInCents),
              }}
            />
          )
        }
      />
      <div className='mt-8'>
        {night.status === 'closed' ? (
          <ClosedNight viewer={viewer} night={night} players={players} />
        ) : (
          <OpenNight viewer={viewer} night={night} players={players} />
        )}
      </div>
    </div>
  );
}
