import { runMigrations } from './scripts/migrate.mjs';

export default async function setup() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL is not set');
  }
  await runMigrations(process.env.TEST_DATABASE_URL);
}
