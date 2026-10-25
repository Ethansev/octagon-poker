import type { PlayerProfile } from '@/app/(group)/players/[id]/load-player';
import { seasonKicker, seasonSpan } from '@/app/(group)/season-copy';
import { VibeMark, vibeLabel } from '@/app/(group)/vibe-mark';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { PlayerAvatar } from '@/players/player-avatar';

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function RankChip({ profile }: { profile: PlayerProfile }) {
  const { rank } = profile.stats;
  if (rank === null) {
    return (
      <span className='inline-flex h-8 items-center rounded-full bg-hero-chip-muted px-3 text-sm font-extrabold text-hero-muted ring-1 ring-current/20'>
        Unranked
      </span>
    );
  }
  return (
    <span className='inline-flex h-8 items-center rounded-full bg-hero-chip px-3 text-sm font-extrabold text-hero-chip-ink tabular-nums'>
      #{rank}
      <span className='ml-1 font-bold opacity-70'>of {profile.rankedCount} up</span>
    </span>
  );
}

export function ProfileHero({ profile }: { profile: PlayerProfile }) {
  const { player, stats, scope } = profile;
  const up = stats.netCents > 0;
  const played = stats.nightsPlayed > 0;

  return (
    <section
      aria-labelledby='player-name'
      className='relative flex h-full flex-col rounded-panel bg-hero p-6 text-hero-ink shadow-hero sm:p-8 lg:p-10'>
      <p className='text-xs font-extrabold tracking-[0.14em] text-current/75 uppercase'>
        {seasonKicker(scope)}
      </p>
      <div className='mt-8 flex items-end gap-5 sm:mt-10'>
        <span className='relative shrink-0'>
          {stats.rank === 1 && (
            <span
              aria-hidden
              className='absolute -top-8 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-4xl sm:-top-9 sm:text-5xl'>
              👑
            </span>
          )}
          <span className='block rounded-full bg-frame p-1.5'>
            <PlayerAvatar
              colorSlot={player.colorSlot}
              name={player.name}
              size={104}
              className='sm:hidden'
            />
            <PlayerAvatar
              colorSlot={player.colorSlot}
              name={player.name}
              size={128}
              className='hidden sm:inline-grid'
            />
          </span>
        </span>
        <div className='min-w-0 pb-1'>
          <h1
            id='player-name'
            className='text-4xl leading-none font-bold tracking-tight break-words sm:text-6xl'>
            {player.name}
          </h1>
          {played && (
            <p className='mt-3 inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-hero-chip px-3 py-1 text-sm font-extrabold text-hero-chip-ink'>
              <VibeMark vibe={profile.vibe} />
              {vibeLabel(profile.vibe)}
            </p>
          )}
        </div>
      </div>

      <div className='mt-auto pt-10'>
        <p className='text-sm font-bold text-current/75'>Net {seasonSpan(scope)}</p>
        <p
          className={cn(
            'mt-1 text-7xl leading-none font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-8xl',
            up ? 'text-hero-figure' : 'text-hero-muted',
          )}>
          {formatNet(stats.netCents)}
        </p>
        <div className='mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-current/20 pt-5'>
          <RankChip profile={profile} />
          <p className='text-sm font-bold text-current/85 tabular-nums'>
            {plural(stats.nightsPlayed, 'night', 'nights')} ·{' '}
            {plural(stats.nightsWon, 'win', 'wins')}
          </p>
        </div>
      </div>
    </section>
  );
}
