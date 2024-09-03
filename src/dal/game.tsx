'use server';
import { openDb } from '@/lib/db';

export type Game = {
  id: number;
  name?: string;
  buy_in: number;
  date: ISODateString;
  game_group_id: number;
};

export type ISODateString = `${number}-${number}-${number}`; // YYYY-MM-DD

export type NewGameInput = Omit<Game, 'id'>;

export type NewGameResponse = {
  success: boolean;
  game?: Game;
  message?: string;
  error?: Error;
};

/*
  Create a new game session in the games table
*/
export async function createNewGame(data: NewGameInput): Promise<NewGameResponse> {
  console.log('data send to addNewGame: ', data);

  let db;
  try {
    db = await openDb();
    const res = await db.run('INSERT INTO games (date, buy_in, game_group_id) VALUES (?, ?, ?)', [
      data.date,
      data.buy_in,
      data.game_group_id,
    ]);

    console.log('res', res);

    if (res.changes && res.changes > 0) {
      const newGame = await db.get('SELECT * FROM games WHERE id = ?', [res.lastID]);
      // TODO: create new type for response object
      return {
        success: true,
        game: newGame
          ? {
              id: newGame.id,
              date: newGame.date,
              buy_in: newGame.buy_in,
              game_group_id: newGame.game_group_id,
            }
          : undefined,
      };
    } else {
      return {
        success: false,
        message: 'Failed to add game: No changes made',
      };
    }
  } catch (err) {
    console.error('error adding new game: ', err);
    return {
      success: false,
      message: `Failed to add game: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export default async function addNewPlayerToGame() {
  // TODO: add function to add player to game
  // will probably accept an array of player ids and a game id
}

export async function getAllGames(): Promise<Game[]> {
  // TODO: make game group id a dynamic parameter
  const db = await openDb();
  return db.all(`
        SELECT 
          g.id, 
          g.name, 
          g.buy_in, 
          g.date, 
          g.game_group_id,
        FROM games g
        WHERE g.game_group_id = 1
        `);
}
