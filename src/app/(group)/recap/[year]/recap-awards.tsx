import { AwardCard, type Award } from '@/app/(group)/recap/[year]/award-card';
import type { RecapView } from '@/app/(group)/recap/[year]/recap-view';
import { cn } from '@/lib/utils';
import { formatNet } from '@/money/money';
import { formatShortNightDate } from '@/nights/dates';
import { joinNames } from '@/nights/names';
import { firstName } from '@/players/first-name';
import { TrendingUp } from 'lucide-react';

function Emoji({ children }: { children: string }) {
  return (
    <span aria-hidden className='text-5xl'>
      {children}
    </span>
  );
}

function names(players: { name: string }[]): string {
  return joinNames(players.map((player) => firstName(player.name)));
}

function awards(view: RecapView): Award[] {
  const { mostNightsWon, longestUpStreak, biggestNight } = view.awards;
  const year = view.scope.year;
  const list: Award[] = [];
  if (mostNightsWon) {
    const shared = mostNightsWon.players.length > 1;
    list.push({
      key: 'most-won',
      kicker: 'Most nights won',
      players: mostNightsWon.players,
      mark: <Emoji>🏆</Emoji>,
      headline: shared
        ? `${names(mostNightsWon.players)} split the most wins`
        : mostNightsWon.count === 1
          ? `${names(mostNightsWon.players)} took the night`
          : `${names(mostNightsWon.players)} kept taking the night`,
      figure: `${mostNightsWon.count} ${mostNightsWon.count === 1 ? 'night' : 'nights'}`,
      footnote: shared ? 'Won apiece' : `Won in ${year}`,
      surface: 'bg-story-1 text-story-1-ink shadow-story',
      figureClass: 'text-story-1-figure',
    });
  }
  if (longestUpStreak) {
    const { live, count } = longestUpStreak;
    list.push({
      key: 'streak',
      kicker: live ? 'Longest up-streak · still going' : 'Longest up-streak',
      players: longestUpStreak.players,
      mark: live ? (
        <Emoji>🔥</Emoji>
      ) : (
        <TrendingUp aria-hidden className='size-10 text-current/60' strokeWidth={2.5} />
      ),
      headline: live
        ? `${names(longestUpStreak.players)} can’t stop winning`
        : `${names(longestUpStreak.players)} had the longest run`,
      figure: count === 1 ? '1 night' : `${count} in a row`,
      footnote: count === 1 ? 'Nobody went up twice running' : 'Nights up, back to back',
      surface: 'bg-story-2 text-story-2-ink shadow-story',
      figureClass: 'text-story-2-figure',
    });
  }
  if (biggestNight) {
    list.push({
      key: 'biggest',
      kicker: 'Biggest single night',
      players: [biggestNight.player],
      mark: <Emoji>🏆</Emoji>,
      headline: `${firstName(biggestNight.player.name)} cleaned up on ${formatShortNightDate(biggestNight.date)}`,
      figure: formatNet(biggestNight.netCents),
      footnote: `The high mark of ${year}`,
      surface: 'bg-story-3 text-story-3-ink shadow-story',
      figureClass: 'text-story-3-figure',
    });
  }
  return list;
}

const columns = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3'];

export function RecapAwards({ view }: { view: RecapView }) {
  const list = awards(view);
  if (list.length === 0) return null;
  return (
    <section aria-labelledby='awards-heading'>
      <h2 id='awards-heading' className='mb-4 text-3xl font-bold tracking-tight lg:mb-5'>
        The awards
      </h2>
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:gap-6', columns[list.length])}>
        {list.map((award, index) => (
          <AwardCard
            key={award.key}
            award={award}
            index={index}
            count={list.length}
            year={view.scope.year}
          />
        ))}
      </div>
    </section>
  );
}
