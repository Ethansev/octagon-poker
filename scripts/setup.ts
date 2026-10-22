import { env } from '@/env';
import { readOwnerSetup, setupOwnerGroup } from '@/groups/setup';

async function main() {
  const setup = readOwnerSetup(process.env);
  if (!setup) throw new Error('OWNER_PASSWORD is not set');
  const group = await setupOwnerGroup(setup);
  console.log(`${env.BETTER_AUTH_URL}/join/${group.inviteCode}`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
