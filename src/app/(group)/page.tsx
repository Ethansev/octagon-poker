import { getViewer } from '@/access/viewer';
import { LastNightCard } from '@/app/(group)/last-night-card';
import { RecentNights } from '@/app/(group)/recent-nights';
import { SeasonSwitcher } from '@/app/(group)/season-switcher';
import { resolveSeason, seasonLabel } from '@/app/(group)/seasons';
import { StandingsBlock } from '@/app/(group)/standings-block';
import { Button } from '@/components/ui/button';
import { listClosedNights, listNights } from '@/nights/nights';
import { listPlayers } from '@/players/players';
import { nightsInSeason } from '@/stats/season';
import { standings } from '@/stats/standings';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ season?: string | string[] }>;
}) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const groupId = viewer.group.id;
  const { season, seasons } = await resolveSeason(groupId, (await searchParams).season);
  const [closedNights, summaries, players] = await Promise.all([
    listClosedNights(groupId),
    listNights(groupId, season),
    listPlayers(groupId),
  ]);
  const names = new Map(players.map((player) => [player.id, player.name]));
  const closed = nightsInSeason(closedNights, season);
  const { ranked, unranked } = standings(closed);
  const last = closed[0];
  const lastLocation = summaries.find((night) => night.id === last?.id)?.location ?? null;
  const previousYear = typeof season === 'number' ? season - 1 : null;
  const previousRecap =
    previousYear !== null && closedNights.some((n) => n.date.startsWith(`${previousYear}-`));
  const label = seasonLabel(season);
  const heading =
    season === 'all'
      ? 'Up all time'
      : season === new Date().getFullYear()
        ? 'Up this year'
        : `Up in ${season}`;

  return (
    <div className='mx-auto max-w-md space-y-4 p-4 pt-6'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-extrabold text-slate-900'>{viewer.group.name}</h1>
          <p className='mt-0.5 text-xs text-slate-500'>
            {closed.length} {closed.length === 1 ? 'night' : 'nights'} ·{' '}
            {ranked.length + unranked.length}{' '}
            {ranked.length + unranked.length === 1 ? 'player' : 'players'}
          </p>
        </div>
        <Button asChild>
          <Link href='/nights/new'>Log a night</Link>
        </Button>
      </div>
      <SeasonSwitcher seasons={seasons} current={season} />
      {last === undefined ? (
        <div className='rounded-xl border border-slate-200 p-4 text-center'>
          <p className='font-semibold text-slate-900'>No nights logged in {label} yet</p>
          {previousRecap && previousYear !== null && (
            <Link
              href={`/recap/${previousYear}`}
              className='mt-1 inline-block text-sm text-slate-600 underline'>
              See the {previousYear} recap
            </Link>
          )}
        </div>
      ) : (
        <LastNightCard night={last} location={lastLocation} names={names} />
      )}
      <StandingsBlock ranked={ranked} unranked={unranked} names={names} heading={heading} />
      <RecentNights nights={summaries} />
    </div>
  );
}
