import { getViewer } from '@/access/viewer';
import { CrewRoster } from '@/app/(group)/_home/crew-roster';
import { loadHome } from '@/app/(group)/_home/load-home';
import { OpenNightBanner } from '@/app/(group)/_home/open-night-banner';
import { PayoutReminders } from '@/app/(group)/_home/payout-reminders';
import { RecapCard } from '@/app/(group)/_home/recap-card';
import { RecentNightsCard } from '@/app/(group)/_home/recent-nights-card';
import { SeasonEmpty } from '@/app/(group)/_home/season-empty';
import { StoryCards } from '@/app/(group)/_home/story-cards';
import { seasonGreeting, seasonKicker, seasonPrefix } from '@/app/(group)/season-copy';
import { SeasonSwitcher } from '@/app/(group)/season-switcher';
import { StandingsCard } from '@/app/(group)/standings-card';
import { cn } from '@/lib/utils';
import { listOutstandingPayouts } from '@/nights/nights';
import { payoutReminders } from '@/nights/payout-reminders';
import { notFound } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ season?: string | string[] }>;
}) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const [home, outstanding] = await Promise.all([
    loadHome(viewer.group.id, (await searchParams).season),
    listOutstandingPayouts(viewer.group.id),
  ]);
  const reminders = payoutReminders(outstanding, viewer.role === 'member' ? viewer.playerId : null);
  const { scope } = home;
  const recapYear = scope.kind === 'all' || home.nightsPlayed === 0 ? null : scope.year;

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10'>
      <div className='mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between'>
        <div className='min-w-0'>
          <p className='text-sm font-extrabold tracking-[0.14em] text-ink-2 uppercase'>
            {seasonKicker(scope)}
          </p>
          <h1 className='mt-1 text-4xl leading-[1.02] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
            {seasonGreeting(scope)}
          </h1>
        </div>
        <SeasonSwitcher seasons={home.seasons} current={home.season} />
      </div>

      <div className='space-y-6 lg:space-y-8'>
        {home.openNight && <OpenNightBanner night={home.openNight} />}
        <PayoutReminders reminders={reminders} />

        {home.nightsPlayed === 0 ? (
          <SeasonEmpty home={home} />
        ) : (
          <>
            <StoryCards home={home} />
            <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
              <div className='lg:col-span-4'>
                <StandingsCard
                  players={home.players}
                  title={`${seasonPrefix(scope)} standings`}
                  playerHref={(playerId) => `/players/${playerId}`}
                />
              </div>
              <div className='lg:col-span-8'>
                <CrewRoster players={home.players} scope={scope} />
              </div>
            </div>
          </>
        )}

        {(home.recentNights.length > 0 || recapYear !== null) && (
          <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
            {home.recentNights.length > 0 && (
              <div className={cn(recapYear === null ? 'lg:col-span-12' : 'lg:col-span-8')}>
                <RecentNightsCard nights={home.recentNights} />
              </div>
            )}
            {recapYear !== null && (
              <div className='lg:col-span-4'>
                <RecapCard year={recapYear} mostNightsWon={home.highlights.mostNightsWon} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
