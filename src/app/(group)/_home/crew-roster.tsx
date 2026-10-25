import type { HomePlayer, HomeSeason } from '@/app/(group)/_home/load-home';
import { seasonSpan } from '@/app/(group)/_home/season-copy';
import { Sparkline } from '@/app/(group)/_home/sparkline';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';
import { playerColor } from '@/players/player-color';
import { vibe, type Vibe } from '@/stats/vibe';
import { Equal, Sprout, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function bubbleSize(player: HomePlayer, topNet: number): number {
  if (player.netCents <= 0 || topNet <= 0) return 56;
  return Math.round(60 + 28 * (player.netCents / topNet));
}

function VibeMark({ vibe }: { vibe: Vibe }) {
  const icon = 'size-3.5 shrink-0';
  switch (vibe.kind) {
    case 'leader':
      return <span aria-hidden>👑</span>;
    case 'streak':
      return <span aria-hidden>🔥</span>;
    case 'night-winner':
      return <span aria-hidden>🏆</span>;
    case 'in-the-green':
      return <TrendingUp aria-hidden className={cn(icon, 'text-win')} strokeWidth={2.5} />;
    case 'even':
      return <Equal aria-hidden className={icon} strokeWidth={2.5} />;
    case 'comeback':
      return <Sprout aria-hidden className={icon} strokeWidth={2.5} />;
  }
}

function vibeLabel(vibe: Vibe): string {
  switch (vibe.kind) {
    case 'leader':
      return 'Top of the table';
    case 'streak':
      return `${vibe.count} up in a row`;
    case 'night-winner':
      return `${vibe.count}× night winner`;
    case 'in-the-green':
      return 'In the green';
    case 'even':
      return 'Dead even';
    case 'comeback':
      return 'Comeback era';
  }
}

function CrewCard({ player, topNet }: { player: HomePlayer; topNet: number }) {
  const color = playerColor(player.playerId);
  const up = player.netCents > 0;
  const mood = vibe(player, player.rank);

  return (
    <li>
      <Link
        href={`/players/${player.playerId}`}
        className={cn(
          'group relative flex h-full cursor-pointer flex-col items-center rounded-card border px-3 pt-5 pb-4 text-center transition hover:-translate-y-1 hover:shadow-lift focus-visible:ring-4 focus-visible:ring-focus/40 focus-visible:outline-none motion-reduce:transition-none sm:px-4',
          up ? 'border-transparent' : 'border-line bg-surface-3',
        )}
        style={up ? { background: color.soft } : undefined}>
        {player.rank !== null && player.rank <= 3 && (
          <span
            className='absolute top-3 left-3 grid size-8 place-items-center rounded-full text-sm font-bold text-on-deep'
            style={{ background: color.deep }}>
            <span className='sr-only'>Rank </span>
            {player.rank}
          </span>
        )}
        <div className='grid h-24 place-items-center'>
          <PlayerAvatar
            playerId={player.playerId}
            name={player.name}
            size={bubbleSize(player, topNet)}
            tone={up ? 'solid' : 'muted'}
            ring={up ? Math.min(2 + player.nightsWon, 6) : 0}
            className='transition group-hover:scale-105 motion-reduce:transition-none'
          />
        </div>
        <p className='mt-2 w-full truncate text-lg font-bold'>{player.name}</p>
        <p
          className={cn(
            'text-3xl leading-tight font-bold tracking-tight tabular-nums',
            up ? 'text-win' : 'text-loss',
          )}>
          {formatNet(player.netCents)}
        </p>
        <p
          className={cn('mt-0.5 text-xs font-bold tabular-nums', up ? 'text-ink-2' : 'text-ink-3')}>
          {player.nightsPlayed} {player.nightsPlayed === 1 ? 'night' : 'nights'} ·{' '}
          {player.nightsWon} {player.nightsWon === 1 ? 'win' : 'wins'}
        </p>
        <div className={cn('mt-2', up ? 'text-ink' : 'text-ink-3')}>
          <Sparkline
            nets={player.history.map((entry) => entry.netCents)}
            stroke={up ? color.solid : 'var(--loss-soft)'}
            width={112}
            height={30}
          />
        </div>
        <span
          className={cn(
            'mt-auto inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[11px] font-extrabold',
            up ? 'bg-surface/80 text-ink' : 'bg-surface text-ink-2',
          )}>
          <VibeMark vibe={mood} />
          {vibeLabel(mood)}
        </span>
      </Link>
    </li>
  );
}

export function CrewRoster({ players, scope }: { players: HomePlayer[]; scope: HomeSeason }) {
  const topNet = Math.max(0, ...players.map((player) => player.netCents));
  const alphabetical = [...players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section
      aria-labelledby='crew-heading'
      className='h-full rounded-panel bg-surface p-5 shadow-card sm:p-7'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 id='crew-heading' className='text-3xl font-bold tracking-tight'>
            The crew
          </h2>
          <p className='mt-1 text-sm font-semibold text-ink-2'>
            Everyone who’s sat down {seasonSpan(scope)}. Bigger bubble, better run.
          </p>
        </div>
        <p className='rounded-full bg-surface-3 px-3 py-1 text-xs font-extrabold text-ink-2'>
          {players.length} {players.length === 1 ? 'player' : 'players'}
        </p>
      </div>
      <ul className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5'>
        {alphabetical.map((player) => (
          <CrewCard key={player.playerId} player={player} topNet={topNet} />
        ))}
      </ul>
    </section>
  );
}
