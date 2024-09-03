import { openDb } from '@/lib/db';
import { Game } from './game';
import { Player } from './player';

export type GameWithPlayers = Game & {
  players: Player[];
};

export async function getAllGamesWithPlayers(): Promise<GameWithPlayers[]> {
  // const games = await getAllGames();
  // const players = await getPlayers();
  const db = await openDb();

  const rows = await db.all(`
    SELECT 
      g.id, g.name, g.date, g.buy_in, g.game_group_id,
      p.id as player_id, p.first_name, p.last_name, p.username, p.net_earnings, p.biggest_win, p.biggest_loss, p.average_earnings_per_session, p.win_rate, p.games_played
    FROM games g
    LEFT JOIN games_players gp ON g.id = gp.game_id
    LEFT JOIN players p ON gp.player_id = p.id
    ORDER BY g.date DESC, g.id, p.id
  `);

  const games: Game[] = [];
  let currentGame: GameWithPlayers | null = null;

  for (const row of rows) {
    if (!currentGame || currentGame.id !== row.id) {
      currentGame = {
        id: row.id,
        name: row.name,
        date: row.date,
        buy_in: row.buy_in,
        game_group_id: row.game_group_id,
        players: [],
      };

      games.push(currentGame);
    }

    if (row.player_id) {
      const player: Player = {
        id: row.player_id,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username,
        net_earnings: row.net_earnings,
        biggest_win: row.biggest_win,
        biggest_loss: row.biggest_loss,
        average_earnings_per_session: row.average_earnings_per_session,
        win_rate: row.win_rate,
        games_played: row.games_played,
      };
      currentGame.players.push(player);
    }
  }

  return games as GameWithPlayers[];
}
