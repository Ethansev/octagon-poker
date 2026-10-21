import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

export async function runMigrations(connectionString) {
  if (!connectionString) {
    throw new Error('Database URL is not set');
  }
  const pool = new pg.Pool({ connectionString });
  try {
    await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
  } finally {
    await pool.end();
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  try {
    await runMigrations(process.env.DATABASE_URL);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
