import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, Pool, type ClientConfig } from 'pg';
import { env } from '@/env';
import * as groups from '@/groups/schema';
import * as nights from '@/nights/schema';
import * as players from '@/players/schema';

export const schema = { ...groups, ...players, ...nights };

class EnvClient extends Client {
  constructor(config?: string | ClientConfig) {
    super(typeof config === 'string' ? config : { ...config, connectionString: env.DATABASE_URL });
  }
}

const pool = new Pool({ Client: EnvClient });

export const db = drizzle(pool, { schema });
