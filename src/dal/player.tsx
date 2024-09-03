'use server';

import { openDb } from '@/lib/db';

export type Player = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  net_earnings: number;
  biggest_win: number;
  biggest_loss: number;
  average_earnings_per_session: number;
  win_rate: number;
  games_played: number;
};

export type NewPlayerInput = Omit<Player, 'id'>;

export type NewPlayerResponse = {
  success: boolean;
  player?: Player;
  message?: string;
  error?: Error;
};

/* 
  Add a new player to the players table
*/
export async function createNewPlayer(data: NewPlayerInput): Promise<NewPlayerResponse> {
  let db;
  try {
    db = await openDb();
    const res = await db.run(
      'INSERT INTO players (first_name, last_name, username) VALUES (?, ?, ?)',
      [data.first_name, data.last_name, data.username],
    );

    if (res.changes && res.changes > 0) {
      const newPlayer = await db.get('SELECT * FROM players WHERE id = ?', [res.lastID]);
      return {
        success: true,
        player: newPlayer
          ? {
              id: newPlayer.id,
              first_name: newPlayer.first_name,
              last_name: newPlayer.last_name,
              username: newPlayer.username,
              net_earnings: newPlayer.net_earnings,
              biggest_win: newPlayer.biggest_win,
              biggest_loss: newPlayer.biggest_loss,
              average_earnings_per_session: newPlayer.average_earnings_per_session,
              win_rate: newPlayer.win_rate,
              games_played: newPlayer.games_played,
            }
          : undefined,
      };
    } else {
      return {
        success: false,
        message: 'Failed to add player: No changes made',
      };
    }
  } catch (err) {
    console.error('error adding new player: ', err);
    return {
      success: false,
      message: `Failed to add player: ${err instanceof Error ? err.message : String(err)}`,
    };
  } finally {
    if (db) {
      await db.close();
    }
  }
}

/*
  Add a new player to a game group
*/
export async function addNewPlayerToGroup(playerId: number): Promise<boolean> {
  'use server';

  let db;
  try {
    db = await openDb();
    // TODO: make game group id dynamic
    const res = await db.run(
      'INSERT INTO players_game_groups (player_id, game_group_id) VALUES (?, ?)',
      [playerId, 1],
    );

    if (res.changes && res.changes > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('error adding new player to group: ', err);
    return false;
  } finally {
    if (db) {
      await db.close();
    }
  }
}

export async function getPlayers(): Promise<Player[]> {
  const db = await openDb();
  return db.all(`
        SELECT 
          p.id, 
          p.first_name, 
          p.last_name, 
          p.username, 
          p.net_earnings, 
          p.biggest_win, 
          p.biggest_loss, 
          p.average_earnings_per_session,
          p.win_rate,
          p.games_played
        FROM players p
        JOIN players_game_groups pgg ON p.id = pgg.player_id
        WHERE pgg.game_group_id = 1
        `);
}
