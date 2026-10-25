import { getViewer } from '@/access/viewer';
import { BackLink } from '@/app/(group)/back-link';
import { loadPlayer } from '@/app/(group)/players/[id]/load-player';
import { ProfileEmpty } from '@/app/(group)/players/[id]/profile-empty';
import { ProfileHero } from '@/app/(group)/players/[id]/profile-hero';
import { ProfileHistory } from '@/app/(group)/players/[id]/profile-history';
import { ProfileStats } from '@/app/(group)/players/[id]/profile-stats';
import { ProfileTrend } from '@/app/(group)/players/[id]/profile-trend';
import { SeasonSwitcher } from '@/app/(group)/season-switcher';
import { getPlayer } from '@/players/players';
import { notFound } from 'next/navigation';
import { z } from 'zod';

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string | string[] }>;
}) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const player = await getPlayer(viewer.group.id, id.data);
  if (!player) notFound();

  const profile = await loadPlayer(viewer.group.id, player, (await searchParams).season);
  const played = profile.nights.length > 0;

  return (
    <div className='mx-auto max-w-[1360px] px-4 pt-6 pb-20 sm:px-6 lg:px-10 lg:pt-10'>
      <div className='mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8'>
        <BackLink href={`/?season=${profile.season}`}>The crew</BackLink>
        <SeasonSwitcher seasons={profile.seasons} current={profile.season} />
      </div>

      <div className='space-y-6 lg:space-y-8'>
        <div className='grid gap-6 lg:grid-cols-12 lg:gap-8'>
          <div className='lg:col-span-5'>
            <ProfileHero profile={profile} />
          </div>
          <div className='lg:col-span-7'>
            {played ? <ProfileTrend profile={profile} /> : <ProfileEmpty profile={profile} />}
          </div>
        </div>
        {played && (
          <>
            <ProfileStats profile={profile} />
            <ProfileHistory profile={profile} />
          </>
        )}
      </div>
    </div>
  );
}
