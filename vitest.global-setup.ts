import { runMigrations } from './scripts/migrate.mjs';

export default async function setup() {
  await runMigrations(process.env.TEST_DATABASE_URL);
}
