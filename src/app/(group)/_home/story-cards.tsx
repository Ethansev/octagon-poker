import { HOME_STORY_COUNT, LastNightStory } from '@/app/(group)/_home/last-night-story';
import type { HomePlayer, HomeView } from '@/app/(group)/_home/load-home';
import { seasonPrefix } from '@/app/(group)/season-copy';
import {
  StoryKicker,
  StorySegments,
  storyCardClass,
  storyLinkClass,
} from '@/app/(group)/story-card';
import { cn } from '@/lib/utils';
import { formatDollars, formatNet } from '@/money/money';
import { formatNightDate, formatShortNightDate } from '@/nights/dates';
import { firstName } from '@/players/first-name';
import { PlayerAvatar } from '@/players/player-avatar';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Story = {
  index: number;
  player: HomePlayer | null;
  kicker: string;
  mark: React.ReactNode;
  headline: string;
  figure: string;
  footnote: string;
  surface: string;
  figureClass: string;
};

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function PlayerStory({ story }: { story: Story }) {
  const { player } = story;
  const body = (
    <>
      <StorySegments index={story.index} count={HOME_STORY_COUNT} tone='story' />
      <StoryKicker>{story.kicker}</StoryKicker>
      <div className='mt-4 flex min-h-16 items-center gap-3'>
        {player && (
          <span className='rounded-full bg-frame p-1'>
            <PlayerAvatar colorSlot={player.colorSlot} name={player.name} size={56} />
          </span>
        )}
        {story.mark}
      </div>
      <p className='mt-4 text-[28px] leading-tight font-semibold tracking-tight text-balance sm:text-2xl'>
        {story.headline}
      </p>
      <p
        className={cn(
          'mt-auto pt-3 text-6xl leading-none font-bold tracking-tight tabular-nums sm:text-5xl',
          story.figureClass,
        )}>
        {story.figure}
      </p>
      <p className='mt-2 text-sm font-bold text-current/70'>{story.footnote}</p>
    </>
  );
  const className = cn(
    storyCardClass,
    'min-h-[300px] lg:col-span-3 lg:min-h-[270px]',
    story.surface,
  );
  if (!player) return <div className={className}>{body}</div>;
  return (
    <Link
      href={`/players/${player.playerId}`}
      className={cn(className, storyLinkClass, 'hover:shadow-lift')}>
      {body}
    </Link>
  );
}

function Emoji({ children }: { children: string }) {
  return (
    <span aria-hidden className='text-4xl'>
      {children}
    </span>
  );
}

function leaderStory(home: HomeView): Story {
  const leader = home.highlights.leader;
  const ran = home.scope.kind === 'past' ? 'ran' : 'is running';
  return {
    index: 1,
    player: leader,
    kicker: `${seasonPrefix(home.scope)} leader`,
    mark: leader ? <Emoji>👑</Emoji> : null,
    headline: leader ? `${firstName(leader.name)} ${ran} the table` : 'The crown is up for grabs',
    figure: leader ? formatNet(leader.netCents) : '—',
    footnote: leader
      ? `${plural(leader.nightsWon, 'win', 'wins')} in ${plural(leader.nightsPlayed, 'night', 'nights')}`
      : 'Nobody is up yet',
    surface: 'bg-story-1 text-story-1-ink shadow-story',
    figureClass: 'text-story-1-figure',
  };
}

function heaterStory(home: HomeView): Story {
  const heater = home.highlights.heater;
  const base = {
    index: 2,
    surface: 'bg-story-2 text-story-2-ink shadow-story',
    figureClass: 'text-story-2-figure',
  };
  if (!heater) {
    return {
      ...base,
      player: null,
      kicker: 'Best streak',
      mark: null,
      headline: 'No streaks yet',
      figure: '—',
      footnote: 'Nobody has strung wins together',
    };
  }
  const name = firstName(heater.player.name);
  if (heater.kind === 'live') {
    return {
      ...base,
      player: heater.player,
      kicker: 'On a heater',
      mark: <Emoji>🔥</Emoji>,
      headline: `${name} can’t stop winning`,
      figure: `${heater.count} in a row`,
      footnote: 'Nights up, and counting',
    };
  }
  return {
    ...base,
    player: heater.player,
    kicker: 'Best streak',
    mark: <TrendingUp aria-hidden className='size-8 text-current/60' strokeWidth={2.5} />,
    headline: `${name} had the longest run`,
    figure: heater.count === 1 ? '1 night' : `${heater.count} in a row`,
    footnote: heater.count === 1 ? 'Nobody has gone up twice running' : 'Nights up back-to-back',
  };
}

function biggestNightStory(home: HomeView): Story {
  const biggest = home.highlights.biggestNight;
  const date = biggest
    ? home.scope.kind === 'all'
      ? formatNightDate(biggest.date)
      : formatShortNightDate(biggest.date)
    : '';
  return {
    index: 3,
    player: biggest?.player ?? null,
    kicker: 'Biggest single night',
    mark: biggest ? <Emoji>🏆</Emoji> : null,
    headline: biggest
      ? `${firstName(biggest.player.name)} cleaned up on ${date}`
      : 'Nobody has gone big yet',
    figure: biggest ? formatNet(biggest.netCents) : '—',
    footnote:
      home.scope.kind === 'current'
        ? 'The one to beat this year'
        : home.scope.kind === 'past'
          ? `The high mark of ${home.scope.year}`
          : 'The all-time record',
    surface: 'bg-story-3 text-story-3-ink shadow-story',
    figureClass: 'text-story-3-figure',
  };
}

function statsKicker(home: HomeView): string {
  if (home.scope.kind === 'current') return `${home.scope.year} so far`;
  if (home.scope.kind === 'past') return `${home.scope.year} in numbers`;
  return 'By the numbers';
}

function SeasonStats({ home }: { home: HomeView }) {
  return (
    <div
      className={cn(
        storyCardClass,
        'min-h-[300px] bg-story-4 text-story-4-ink shadow-story-4 lg:col-span-3 lg:min-h-[270px]',
      )}>
      <StorySegments index={4} count={HOME_STORY_COUNT} tone='story' />
      <StoryKicker>{statsKicker(home)}</StoryKicker>
      <dl className='mt-4 grid grid-cols-2 gap-x-4 gap-y-5'>
        <div className='flex flex-col-reverse'>
          <dt className='mt-1 text-sm font-bold text-current/70'>
            {home.nightsPlayed === 1 ? 'night played' : 'nights played'}
          </dt>
          <dd className='text-5xl leading-none font-bold tracking-tight tabular-nums'>
            {home.nightsPlayed}
          </dd>
        </div>
        <div className='flex flex-col-reverse'>
          <dt className='mt-1 text-sm font-bold text-current/70'>in the crew</dt>
          <dd className='text-5xl leading-none font-bold tracking-tight tabular-nums'>
            {home.players.length}
          </dd>
        </div>
      </dl>
      <div className='mt-auto pt-5'>
        <p className='text-4xl leading-none font-bold tracking-tight text-story-4-figure tabular-nums'>
          {formatDollars(home.potCents)}
        </p>
        <p className='mt-1 text-sm font-bold text-current/70'>has crossed the table</p>
      </div>
    </div>
  );
}

export function StoryCards({ home }: { home: HomeView }) {
  if (!home.lastNight) return null;
  return (
    <section aria-label='Highlights' className='-mx-4 sm:-mx-6 lg:mx-0'>
      <div className='-mb-6 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-10 sm:scroll-px-6 sm:px-6 lg:mb-0 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden'>
        <LastNightStory night={home.lastNight} />
        <PlayerStory story={leaderStory(home)} />
        <PlayerStory story={heaterStory(home)} />
        <PlayerStory story={biggestNightStory(home)} />
        <SeasonStats home={home} />
      </div>
    </section>
  );
}
