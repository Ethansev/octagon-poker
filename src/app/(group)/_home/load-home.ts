import { resolveSeason } from '@/app/(group)/seasons';
import { currentYearInGroup } from '@/dates/group-time';
import { listClosedNights, listNights, type NightSummary } from '@/nights/nights';
import { listPlayers } from '@/players/players';
import { nightPot, nightWinners, seatNet, type ClosedNight } from '@/stats/nights';
import type { PlayerSeason } from '@/stats/player-season';
import { recap } from '@/stats/recap';
import { nightsInSeason, type Season } from '@/stats/season';
import { hottestStreak, type Heater } from '@/stats/streaks';

export type HomeSeason =
  { kind: 'current'; year: number } | { kind: 'past'; year: number } | { kind: 'all' };

export type HomePlayer = PlayerSeason & { name: string; colorSlot: number; rank: number | null };

export type HomeSeat = { playerId: string; name: string; colorSlot: number; netCents: number };

export type LastNight = {
  id: string;
  date: string;
  location: string | null;
  potCents: number;
  winners: HomeSeat[];
  seats: HomeSeat[];
};

export type RecentNight = NightSummary & {
  winners: { playerId: string; name: string; colorSlot: number }[];
};

export type HomeHighlights = {
  leader: HomePlayer | null;
  heater: (Heater & { player: HomePlayer }) | null;
  biggestNight: { player: HomePlayer; date: string; netCents: number } | null;
  mostNightsWon: { players: HomePlayer[]; count: number } | null;
};

export type HomeView = {
  season: Season;
  seasons: number[];
  scope: HomeSeason;
  nightsPlayed: number;
  potCents: number;
  players: HomePlayer[];
  highlights: HomeHighlights;
  lastNight: LastNight | null;
  openNight: NightSummary | null;
  recentNights: RecentNight[];
  previousRecapYear: number | null;
};

function homeSeason(season: Season, currentYear: number): HomeSeason {
  if (season === 'all') return { kind: 'all' };
  return season === currentYear
    ? { kind: 'current', year: season }
    : { kind: 'past', year: season };
}

type Identify = (playerId: string) => { name: string; colorSlot: number };

function seatsOf(night: ClosedNight, identify: Identify): HomeSeat[] {
  return night.seats
    .map((seat) => ({
      playerId: seat.playerId,
      ...identify(seat.playerId),
      netCents: seatNet(seat),
    }))
    .sort((a, b) => b.netCents - a.netCents || a.name.localeCompare(b.name));
}

function lastNightOf(
  night: ClosedNight | undefined,
  summaries: NightSummary[],
  identify: Identify,
): LastNight | null {
  if (!night) return null;
  const winnerIds = new Set(nightWinners(night.seats));
  const seats = seatsOf(night, identify);
  return {
    id: night.id,
    date: night.date,
    location: summaries.find((summary) => summary.id === night.id)?.location ?? null,
    potCents: nightPot(night.seats),
    winners: seats.filter((seat) => winnerIds.has(seat.playerId)),
    seats,
  };
}

function recentNightsOf(
  summaries: NightSummary[],
  closed: ClosedNight[],
  identify: Identify,
): RecentNight[] {
  const seatsById = new Map(closed.map((night) => [night.id, night.seats]));
  return summaries.map((summary) => ({
    ...summary,
    winners: nightWinners(seatsById.get(summary.id) ?? [])
      .map((playerId) => ({ playerId, ...identify(playerId) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function loadHome(
  groupId: string,
  rawSeason: string | string[] | undefined,
): Promise<HomeView> {
  const { season, seasons } = await resolveSeason(groupId, rawSeason);
  const [allClosed, summaries, roster] = await Promise.all([
    listClosedNights(groupId),
    listNights(groupId, season),
    listPlayers(groupId),
  ]);
  const byPlayerId = new Map(roster.map((player) => [player.id, player]));
  const identify: Identify = (playerId) => {
    const player = byPlayerId.get(playerId);
    return { name: player?.name ?? 'Unknown', colorSlot: player?.colorSlot ?? 0 };
  };
  const scope = homeSeason(season, currentYearInGroup());
  const closed = nightsInSeason(allClosed, season);
  const awards = recap(closed);
  const rankOf = new Map(awards.standings.ranked.map((row, index) => [row.playerId, index + 1]));
  const players = awards.players.map((player) => ({
    ...player,
    ...identify(player.playerId),
    rank: rankOf.get(player.playerId) ?? null,
  }));
  const byId = new Map(players.map((player) => [player.playerId, player]));

  const heater = hottestStreak(awards.players, scope.kind === 'past' ? 'finished' : 'ongoing');
  const heaterPlayer = heater ? byId.get(heater.playerId) : undefined;
  const biggest = awards.biggestNight;
  const biggestPlayer = biggest ? byId.get(biggest.playerId) : undefined;
  const mostWon = awards.mostNightsWon;
  const previousYear = scope.kind === 'all' ? null : scope.year - 1;

  return {
    season,
    seasons,
    scope,
    nightsPlayed: closed.length,
    potCents: closed.reduce((sum, night) => sum + nightPot(night.seats), 0),
    players,
    highlights: {
      leader: players.find((player) => player.rank === 1) ?? null,
      heater: heater && heaterPlayer ? { ...heater, player: heaterPlayer } : null,
      biggestNight:
        biggest && biggestPlayer
          ? { player: biggestPlayer, date: biggest.date, netCents: biggest.netCents }
          : null,
      mostNightsWon: mostWon
        ? {
            players: players.filter((player) => mostWon.playerIds.includes(player.playerId)),
            count: mostWon.count,
          }
        : null,
    },
    lastNight: lastNightOf(closed[0], summaries, identify),
    openNight: summaries.find((night) => night.status === 'open') ?? null,
    recentNights: recentNightsOf(summaries, closed, identify),
    previousRecapYear:
      previousYear !== null && allClosed.some((night) => night.date.startsWith(`${previousYear}-`))
        ? previousYear
        : null,
  };
}
