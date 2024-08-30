import { openDb } from './db';

export async function initDb() {
  console.log('Initializing database...');
  const db = await openDb();

  // TODO: check if sqlite file already exists before creating tables
  await db.exec(`
        CREATE TABLE IF NOT EXISTS game_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NULL,
            date DATE NOT NULL,
            buy_in NUMERIC NOT NULL DEFAULT 0,
            game_group_id INTEGER NOT NULL,
            FOREIGN KEY (game_group_id) REFERENCES game_groups(id)
        );

        CREATE TABLE IF NOT EXISTS player_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            rebuys INTEGER,
            buy_in NUMERIC NOT NULL,
            total_cashin NUMERIC NOT NULL,
            total_cashout NUMERIC NOT NULL,

            net_earnings NUMERIC NOT NULL,
            cumulative_earnings NUMERIC NOT NULL,
            
            FOREIGN KEY (game_id) REFERENCES games(id),
            FOREIGN KEY (player_id) REFERENCES players(id)
        );

        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NULL,
            username TEXT NULL,
            net_earnings NUMERIC NOT NULL DEFAULT 0,
            biggest_win NUMERIC NOT NULL DEFAULT 0,
            biggest_loss NUMERIC NOT NULL DEFAULT 0,
            average_earnings_per_session NUMERIC NOT NULL DEFAULT 0,
            win_rate NUMERIC NOT NULL DEFAULT 0,
            games_played INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS games_players (
            game_id INTEGER,
            player_id INTEGER,
            PRIMARY KEY (game_id, player_id),
            FOREIGN KEY (game_id) REFERENCES games(id),
            FOREIGN KEY (player_id) REFERENCES players(id)
        );

        CREATE TABLE IF NOT EXISTS players_game_groups (
            player_id INTEGER,
            game_group_id INTEGER,
            PRIMARY KEY (player_id, game_group_id),
            FOREIGN KEY (player_id) REFERENCES players(id),
            FOREIGN KEY (game_group_id) REFERENCES game_groups(id)
        );
    `);

  // await db.exec(`
  //     CREATE TABLE IF NOT EXISTS items (
  //         id INTEGER PRIMARY KEY AUTOINCREMENT,
  //         name TEXT,
  //         description TEXT
  //     )
  // `);

  // const count = await db.get('SELECT COUNT(*) as count FROM items');

  // if (count.count === 0) {
  //     await db.run(`
  //         INSERT INTO items (name, description) VALUES
  //         ('Item 1', 'Description for Item 1'),
  //         ('Item 2', 'Description for Item 2'),
  //         ('Item 3', 'Description for Item 3')
  //     `);
  // }
}
