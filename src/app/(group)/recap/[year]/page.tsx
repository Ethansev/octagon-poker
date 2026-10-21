import { getViewer } from '@/access/viewer';
import { AwardCard } from '@/app/(group)/recap/[year]/award-card';
import { PlayerCard } from '@/app/(group)/recap/[year]/player-card';
import { StandingsBlock } from '@/app/(group)/standings-block';
import { currentYearInGroup } from '@/dates/group-time';
import { formatNet } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import { listClosedNights } from '@/nights/nights';
import { listPlayers } from '@/players/players';
import { recap } from '@/stats/recap';
import { nightsInSeason } from '@/stats/season';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function RecapPage({ params }: { params: Promise<{ year: string }> }) {
  const viewer = await getViewer();
  if (!viewer) notFound();

  const rawYear = (await params).year;
  const currentYear = currentYearInGroup();
  if (!/^\d{4}$/.test(rawYear) || Number(rawYear) > currentYear) notFound();
  const year = Number(rawYear);

  const [closedNights, players] = await Promise.all([
    listClosedNights(viewer.group.id),
    listPlayers(viewer.group.id),
  ]);
  const names = new Map(players.map((player) => [player.id, player.name]));
  const nameOf = (id: string) => names.get(id) ?? 'Unknown';
  const nameList = (ids: string[]) => joinNames(ids.map(nameOf));
  const result = recap(nightsInSeason(closedNights, year));
  const { mostNightsWon, biggestNight, longestUpStreak } = result;
  const title = year === currentYear ? `${year} so far` : `${year} recap`;

  return (
    <div className='mx-auto max-w-md space-y-5 p-4 pt-6'>
      <div>
        <Link href={`/?season=${year}`} className='text-xs text-slate-500'>
          ← {viewer.group.name}
        </Link>
        <h1 className='text-xl font-extrabold text-slate-900'>{title}</h1>
      </div>
      {result.players.length === 0 ? (
        <p className='rounded-xl border border-slate-200 p-4 text-center text-slate-600'>
          No nights logged in {year}.
        </p>
      ) : (
        <>
          <StandingsBlock
            ranked={result.standings.ranked}
            unranked={result.standings.unranked}
            names={names}
            heading={year === currentYear ? 'Standings so far' : 'Final standings'}
          />
          {(mostNightsWon || biggestNight || longestUpStreak) && (
            <section className='space-y-2'>
              <h2 className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
                Awards
              </h2>
              {mostNightsWon && (
                <AwardCard
                  title='Most nights won'
                  winner={nameList(mostNightsWon.playerIds)}
                  detail={`${mostNightsWon.count} ${mostNightsWon.count === 1 ? 'night' : 'nights'}`}
                />
              )}
              {biggestNight && (
                <AwardCard
                  title='Biggest night'
                  winner={nameOf(biggestNight.playerId)}
                  detail={`${formatNet(biggestNight.netCents)} on ${formatNightDate(biggestNight.date)}`}
                />
              )}
              {longestUpStreak && (
                <AwardCard
                  title='Longest up-streak'
                  winner={nameList(longestUpStreak.playerIds)}
                  detail={`${longestUpStreak.count} ${longestUpStreak.count === 1 ? 'night' : 'nights'} in a row`}
                />
              )}
            </section>
          )}
          <section>
            <h2 className='mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase'>
              Players
            </h2>
            <ul className='space-y-2'>
              {result.players.map((player) => (
                <PlayerCard
                  key={player.playerId}
                  player={player}
                  name={nameOf(player.playerId)}
                  year={year}
                />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
