import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, Pool, type ClientConfig } from 'pg';
import * as auth from '@/auth/schema';
import { env } from '@/env';
import * as groups from '@/groups/schema';
import * as nights from '@/nights/schema';
import * as players from '@/players/schema';

export const schema = { ...auth, ...groups, ...players, ...nights };

class EnvClient extends Client {
  constructor(config?: string | ClientConfig) {
    super(typeof config === 'string' ? config : { ...config, connectionString: env.DATABASE_URL });
  }
}

declare global {
  var octagonPool: Pool | undefined;
}

function createPool(): Pool {
  const created = new Pool({ Client: EnvClient });
  created.on('error', (error) => {
    console.error('Unexpected Postgres pool error', error);
  });
  return created;
}

const pool = globalThis.octagonPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalThis.octagonPool = pool;
}

export const db = drizzle(pool, { schema });
