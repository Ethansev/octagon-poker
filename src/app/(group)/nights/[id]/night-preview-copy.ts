import { winnerHeadline } from '@/app/(group)/nights/[id]/winner-copy';
import { formatDollars } from '@/money/money';
import { formatNightTime, formatShortNightDate } from '@/nights/dates';
import type { NightDetail } from '@/nights/nights';
import { firstName } from '@/players/first-name';

export type PreviewNight = Pick<
  NightDetail,
  'date' | 'startTime' | 'location' | 'buyInCents' | 'status' | 'winners'
> & {
  seats: Pick<NightDetail['seats'][number], 'playerId' | 'playerName' | 'buyInCents'>[];
};

function players(count: number): string {
  return count === 1 ? '1 player' : `${count} players`;
}

export function nightPreviewCopy(
  night: PreviewNight,
  goingCount: number,
): { title: string; description: string } {
  if (night.status === 'closed') {
    const winners = night.seats
      .filter((seat) => night.winners.includes(seat.playerId))
      .map((seat) => firstName(seat.playerName));
    const potCents = night.seats.reduce((sum, seat) => sum + seat.buyInCents, 0);
    return {
      title: `${winnerHeadline(winners)} · Octagon Poker`,
      description: `${formatDollars(potCents)} pot · ${players(night.seats.length)}`,
    };
  }

  const when = night.startTime === null ? '' : `, ${formatNightTime(night.startTime)}`;
  const where = night.location ? ` at ${night.location}` : '';
  const details = [
    night.buyInCents === null ? null : `${formatDollars(night.buyInCents)} buy-in`,
    goingCount === 0 ? null : `${players(goingCount)} so far`,
  ].filter((detail) => detail !== null);
  return {
    title: `Poker night · ${formatShortNightDate(night.date)}${when}${where}`,
    description: details.length === 0 ? 'You’re invited' : details.join(' · '),
  };
}
