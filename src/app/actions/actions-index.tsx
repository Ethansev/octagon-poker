'use server';

import { openDb } from '@/lib/db';
import { NewGameInput, NewGameResponse } from '@/types';



/*
  Add a new session to the database
*/
export async function addNewGame(data: NewGameInput): Promise<NewGameResponse> {
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
