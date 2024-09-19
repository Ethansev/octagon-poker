'use server';
import { openDb } from '@/lib/db';

export type PlayerSession = {
  id: number;
  game_id: number;
  player_id: number;
  rebuys: number;
  buy_in: number;
  total_cashin: number;
  total_cashout: number;
  total_earnings: number; // TODO: add this to database
  cumulative_earnings?: number;
};

export type PlayerSessionWithPlayerInfo = PlayerSession & {
  first_name: string;
  last_name?: string;
  username?: string;
  net_earnings_before: number;
};

// Used for the frontend
// export type NewPlayerSessionInput = Omit<PlayerSession, 'id' | 'cumulative_earnings'>;
export type NewPlayerSession = {
  // TODO: PlayerSession but with optional fields for user input
  game_id: number;
  player_id: number;
  rebuys?: number;
  buy_in?: number;
  total_cashin?: number;
  total_cashout?: number;
  total_earnings?: number; // TODO: add this to database
  cumulative_earnings?: number;
};

export type NewPlayerSessionWithPlayerInfo = NewPlayerSession & {
  first_name: string;
  last_name?: string;
  username?: string;
  net_earnings_before: number;
};

export type TableEntry =
  | (PlayerSessionWithPlayerInfo & { isNew: false })
  | (NewPlayerSessionWithPlayerInfo & { isNew: true });

// TODO: can probably remove this
// export type NewPlayerSessionWithPlayerInfoInput = Omit<
//   PlayerSessionWithPlayerInfo,
//   'id' | 'cumulative_earnings'
// >;

/* 
  Get all player sessions for a given game with player info
*/
export async function getPlayerSessionsPerGame(
  gameId: number,
): Promise<PlayerSessionWithPlayerInfo[]> {
  const db = await openDb();
  const res = await db.all(
    `
    SELECT 
      ps.*, 
      p.first_name, 
      p.last_name, 
      p.username, 
      p.net_earnings as net_earnings_before 
    FROM player_sessions ps 
    JOIN players p ON ps.player_id = p.id 
    WHERE game_id = ?
  `,
    [gameId],
  );
  return res;
}

export async function getPlayerSessionsPerPlayer(
  playerId: number,
): Promise<PlayerSessionWithPlayerInfo[]> {
  // should return a list of player sessions
  const db = await openDb();
  const sql = `
    SELECT ps.*, p.first_name, p.last_name, p.username, p.net_earnings as net_earnings_before
    FROM player_sessions ps
    JOIN games g ON ps.game_id = g.id
    JOIN players p ON ps.player_id = p.id
    WHERE ps.player_id = ?
  `;

  const res = await db.all(sql, [playerId]);

  return res;
}

// TODO: error handling
// TODO: update cumulative_earnings
export async function createPlayerSessions(playerSessions: NewPlayerSession[]) {
  if (playerSessions.length == 0) return;
  const db = await openDb();
  const sql = `
    INSERT INTO player_sessions (game_id, player_id, rebuys, buy_in, total_cashin, total_cashout, cumulative_earnings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  for (const session of playerSessions) {
    const result = await db.run(sql, [
      session.game_id,
      session.player_id,
      session.rebuys,
      session.buy_in,
      session.total_cashin,
      session.total_cashout,
      session.cumulative_earnings,
    ]);

    console.log('printing result after insert: ', result);
  }
}

// TODO: error handling
// TODO: update cumulative_earnings
export async function updatePlayerSessions(playerSessions: PlayerSession[]) {
  if (playerSessions.length == 0) return;
  const db = await openDb();
  const sql = `
  UPDATE player_sessions 
  SET game_id = ?,
      player_id = ?,
      rebuys = ?,
      buy_in = ?,
      total_cashin = ?,
      total_cashout = ?,
      cumulative_earnings = ?
  WHERE id = ?
`;

  for (const session of playerSessions) {
    // TODO: get previous sessions and add up the earnings
    const result = await db.run(sql, [
      session.game_id,
      session.player_id,
      session.rebuys,
      session.buy_in,
      session.total_cashin,
      session.total_cashout,
      session.cumulative_earnings,
      session.id,
    ]);
    console.log('printing result after update: ', result);
  }
}

export async function deleteSinglePlayerSession(playerSessions: PlayerSession) {
  const db = await openDb();
  const sql = `
    DELETE FROM player_sessions WHERE id = ?
  `;
  const result = await db.run(sql, [playerSessions.id]);
  console.log('printing result after delete: ', result);
}
