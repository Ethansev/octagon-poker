import { listClosedNights, type NightDetail } from '@/nights/nights';
import { seasonWinNumber } from '@/stats/player-season';
import { nightsInSeason } from '@/stats/season';

export type ResultSeat = {
  playerId: string;
  name: string;
  colorSlot: number;
  buyInCents: number;
  cashOutCents: number;
  netCents: number;
  won: boolean;
  winNumber: number | null;
};

export type NightResults = {
  year: number;
  potCents: number;
  seats: ResultSeat[];
  winners: ResultSeat[];
};

export async function loadNightResults(groupId: string, night: NightDetail): Promise<NightResults> {
  const year = Number(night.date.slice(0, 4));
  const winnerIds = new Set(night.winners);
  const season = winnerIds.size === 0 ? [] : nightsInSeason(await listClosedNights(groupId), year);

  const seats = night.seats
    .map((seat) => {
      const cashOutCents = seat.cashOutCents ?? 0;
      const won = winnerIds.has(seat.playerId);
      return {
        playerId: seat.playerId,
        name: seat.playerName,
        colorSlot: seat.playerColorSlot,
        buyInCents: seat.buyInCents,
        cashOutCents,
        netCents: cashOutCents - seat.buyInCents,
        won,
        winNumber: won ? seasonWinNumber(season, night.id, seat.playerId) : null,
      };
    })
    .sort((a, b) => b.netCents - a.netCents || a.name.localeCompare(b.name));

  return {
    year,
    potCents: seats.reduce((sum, seat) => sum + seat.buyInCents, 0),
    seats,
    winners: seats.filter((seat) => seat.won),
  };
}
