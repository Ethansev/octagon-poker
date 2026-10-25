import { getViewer } from '@/access/viewer';
import { SeasonSwitcher } from '@/app/(group)/season-switcher';
import { resolveSeason } from '@/app/(group)/seasons';
import { formatNet } from '@/money/money';
import { formatNightDate } from '@/nights/dates';
import { listClosedNights } from '@/nights/nights';
import { getPlayer } from '@/players/players';
import { playerSeason } from '@/stats/player-season';
import { nightsInSeason } from '@/stats/season';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'up' }) {
  return (
    <div className='rounded-2xl bg-surface px-3 py-2 shadow-card'>
      <div className='text-[10px] font-semibold tracking-wider text-ink-2 uppercase'>{label}</div>
      <div className={`text-lg font-bold tabular-nums ${tone === 'up' ? 'text-win' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}

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

  const { season, seasons } = await resolveSeason(viewer.group.id, (await searchParams).season);
  const closed = nightsInSeason(await listClosedNights(viewer.group.id), season);
  const stats = playerSeason(closed, player.id);
  const history = [...stats.history].reverse();

  return (
    <div className='mx-auto max-w-md space-y-4 p-4 pt-6'>
      <h1 className='text-xl font-extrabold text-ink'>{player.name}</h1>
      <SeasonSwitcher seasons={seasons} current={season} />
      <div className='grid grid-cols-2 gap-2'>
        <Tile
          label='Net'
          value={formatNet(stats.netCents)}
          tone={stats.netCents > 0 ? 'up' : undefined}
        />
        <Tile label='Nights played' value={String(stats.nightsPlayed)} />
        <Tile label='Nights won' value={String(stats.nightsWon)} />
        <Tile
          label='Biggest night'
          value={stats.biggestNight ? formatNet(stats.biggestNight.netCents) : '—'}
          tone={stats.biggestNight ? 'up' : undefined}
        />
        <Tile label='Longest up-streak' value={String(stats.longestUpStreak)} />
      </div>
      {history.length === 0 ? (
        <p className='text-sm text-ink-2'>No nights played in this season yet.</p>
      ) : (
        <section>
          <h2 className='mb-1 text-[10px] font-semibold tracking-wider text-ink-2 uppercase'>
            History
          </h2>
          <ul>
            {history.map((entry) => (
              <li key={entry.nightId} className='border-b border-line/60'>
                <Link
                  href={`/nights/${entry.nightId}`}
                  className='flex items-center justify-between px-0.5 py-2'>
                  <span className='text-ink'>{formatNightDate(entry.date)}</span>
                  <span className='flex items-center gap-2'>
                    {entry.won && <span aria-label='Won the night'>🏆</span>}
                    <span
                      className={
                        entry.netCents > 0
                          ? 'font-bold text-win tabular-nums'
                          : 'text-loss tabular-nums'
                      }>
                      {formatNet(entry.netCents)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
