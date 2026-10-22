import { env } from '@/env';
import { readOwnerSetup, setupOwnerGroup } from '@/groups/setup';
import { runMigrations } from './migrate.mjs';

async function main() {
  await runMigrations(env.DATABASE_URL);
  const setup = readOwnerSetup(process.env);
  if (!setup) {
    console.log('OWNER_PASSWORD is not set; skipping owner setup.');
    return;
  }
  const group = await setupOwnerGroup(setup);
  console.log(`Join link: ${env.BETTER_AUTH_URL}/join/${group.inviteCode}`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
