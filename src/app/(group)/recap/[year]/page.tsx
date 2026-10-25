import { getViewer } from '@/access/viewer';
import { BackLink } from '@/app/(group)/back-link';
import { PlayerCard } from '@/app/(group)/recap/[year]/player-card';
import { RecapAwards } from '@/app/(group)/recap/[year]/recap-awards';
import { RecapEmpty } from '@/app/(group)/recap/[year]/recap-empty';
import { RecapHero } from '@/app/(group)/recap/[year]/recap-hero';
import { recapView } from '@/app/(group)/recap/[year]/recap-view';
import { identifyFrom } from '@/app/(group)/season-players';
import { SegmentedNav } from '@/app/(group)/segmented-nav';
import { StandingsCard } from '@/app/(group)/standings-card';
import { currentYearInGroup } from '@/dates/group-time';
import { listClosedNights } from '@/nights/nights';
import { listPlayers } from '@/players/players';
import { nightsInSeason, yearsWithNights } from '@/stats/season';
import { notFound } from 'next/navigation';

export default async function RecapPage({ params }: { params: Promise<{ year: string }> }) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const rawYear = (await params).year;
  const currentYear = currentYearInGroup();
  if (!/^\d{4}$/.test(rawYear) || Number(rawYear) > currentYear) notFound();
  const year = Number(rawYear);

  const [closedNights, roster] = await Promise.all([
    listClosedNights(viewer.group.id),
    listPlayers(viewer.group.id),
  ]);
  const view = recapView(nightsInSeason(closedNights, year), identifyFrom(roster), {
    kind: year === currentYear ? 'current' : 'past',
    year,
  });
  const years = yearsWithNights(closedNights, currentYear);
  const latestWithNights = years.find((candidate) =>
    closedNights.some((night) => night.date.startsWith(`${candidate}-`)),
  );

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10'>
      <div className='mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8'>
        <BackLink href={`/?season=${year}`}>{viewer.group.name}</BackLink>
        <SegmentedNav
          label='Year'
          items={years.map((candidate) => ({
            href: `/recap/${candidate}`,
            label: String(candidate),
            active: candidate === year,
          }))}
        />
      </div>

      {view.players.length === 0 ? (
        <RecapEmpty
          year={year}
          latestYear={
            latestWithNights !== undefined && latestWithNights !== year ? latestWithNights : null
          }
        />
      ) : (
        <div className='space-y-8 lg:space-y-10'>
          <RecapHero view={view} />
          <RecapAwards view={view} />
          <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
            <div className='lg:col-span-4'>
              <StandingsCard
                players={view.players}
                title={view.scope.kind === 'current' ? 'Standings so far' : 'Final standings'}
                playerHref={(playerId) => `/players/${playerId}?season=${year}`}
              />
            </div>
            <section
              aria-labelledby='players-heading'
              className='rounded-panel bg-surface p-5 shadow-card sm:p-7 lg:col-span-8'>
              <h2 id='players-heading' className='text-3xl font-bold tracking-tight'>
                Everyone’s {year}
              </h2>
              <p className='mt-1 text-sm font-semibold text-ink-2'>
                Every player who sat down, biggest winners first.
              </p>
              <ul className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {view.players.map((player) => (
                  <PlayerCard key={player.playerId} player={player} year={year} />
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
