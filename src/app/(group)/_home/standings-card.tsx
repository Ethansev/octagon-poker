import type { HomePlayer, HomeSeason } from '@/app/(group)/_home/load-home';
import { seasonPrefix } from '@/app/(group)/_home/season-copy';
import { formatNet } from '@/money/money';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import Link from 'next/link';

const PODIUM = [
  { place: 2, height: 'h-20', avatar: 56 },
  { place: 1, height: 'h-28', avatar: 68 },
  { place: 3, height: 'h-14', avatar: 50 },
];

const rowLink =
  'flex cursor-pointer items-center gap-3 rounded-2xl px-2 transition focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none';

function Podium({ ranked }: { ranked: HomePlayer[] }) {
  const byPlace = new Map(ranked.map((player) => [player.rank, player]));
  return (
    <ol className='mt-8 grid grid-cols-3 items-end gap-2'>
      {PODIUM.map(({ place, height, avatar }) => {
        const player = byPlace.get(place);
        if (!player) return <li key={place} aria-hidden />;
        const color = playerColor(player.colorSlot);
        return (
          <li key={place} className='min-w-0'>
            <Link
              href={`/players/${player.playerId}`}
              className='group flex cursor-pointer flex-col items-center rounded-2xl focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none'>
              <span className='relative transition group-hover:-translate-y-1 motion-reduce:transition-none'>
                {place === 1 && (
                  <span
                    aria-hidden
                    className='absolute -top-6 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-2xl'>
                    👑
                  </span>
                )}
                <PlayerAvatar
                  colorSlot={player.colorSlot}
                  name={player.name}
                  size={avatar}
                  ring={3}
                />
              </span>
              <span className='mt-2 max-w-full truncate text-base font-bold'>
                {firstName(player.name)}
              </span>
              <span className='text-sm font-extrabold text-win tabular-nums'>
                {formatNet(player.netCents)}
              </span>
              <span
                className={`mt-2 flex w-full ${height} items-start justify-center rounded-t-2xl pt-2 text-2xl font-extrabold transition group-hover:brightness-105 motion-reduce:transition-none`}
                style={{ background: color.solid, color: color.ink }}>
                <span className='sr-only'>Place </span>
                {place}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function StandingsCard({ players, scope }: { players: HomePlayer[]; scope: HomeSeason }) {
  const ranked = players
    .filter((player) => player.rank !== null)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  const rest = ranked.filter((player) => (player.rank ?? 0) > 3);
  const unranked = players.filter((player) => player.rank === null);

  return (
    <section
      aria-labelledby='standings-heading'
      className='h-full rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <h2 id='standings-heading' className='text-3xl font-bold tracking-tight'>
        {seasonPrefix(scope)} standings
      </h2>
      <p className='mt-1 text-sm font-semibold text-ink-2'>
        Ranked by money won. Only the winners get a number.
      </p>

      {ranked.length > 0 ? (
        <Podium ranked={ranked} />
      ) : (
        <p className='mt-6 rounded-3xl border border-dashed border-line px-4 py-6 text-center text-sm font-bold text-ink-2'>
          Nobody’s up yet. The podium is wide open.
        </p>
      )}

      {rest.length > 0 && (
        <ol className='mt-4 space-y-1'>
          {rest.map((player) => (
            <li key={player.playerId}>
              <Link
                href={`/players/${player.playerId}`}
                className={`${rowLink} py-2 hover:bg-surface-2`}>
                <span className='w-6 text-center text-lg font-bold text-ink-3 tabular-nums'>
                  {player.rank}
                </span>
                <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={36} />
                <span className='min-w-0 flex-1 truncate font-bold'>{player.name}</span>
                <span className='text-lg font-bold text-win tabular-nums'>
                  {formatNet(player.netCents)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {unranked.length > 0 && (
        <div className='mt-5 rounded-3xl bg-surface-2 p-3'>
          <h3 className='px-2 text-xs font-extrabold tracking-[0.12em] text-ink-3 uppercase'>
            Still chasing it
          </h3>
          <ul className='mt-2 space-y-0.5'>
            {unranked.map((player) => (
              <li key={player.playerId}>
                <Link
                  href={`/players/${player.playerId}`}
                  className={`${rowLink} py-1.5 text-ink-2 hover:bg-surface hover:text-ink`}>
                  <PlayerAvatar
                    colorSlot={player.colorSlot}
                    name={player.name}
                    size={28}
                    tone='muted'
                  />
                  <span className='min-w-0 flex-1 truncate text-sm font-bold'>{player.name}</span>
                  <span className='text-sm font-bold text-loss tabular-nums'>
                    {formatNet(player.netCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
