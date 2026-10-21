import { eq } from 'drizzle-orm';
import { createAuth } from '@/auth/auth';
import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { env } from '@/env';
import { createGroup } from '@/groups/groups';
import { groups } from '@/groups/schema';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const email = required('OWNER_EMAIL');
const password = required('OWNER_PASSWORD');
const groupName = required('GROUP_NAME');

async function findOwnerId(): Promise<string | null> {
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  return owner?.id ?? null;
}

async function main() {
  let ownerId = await findOwnerId();
  if (!ownerId) {
    await createAuth({ allowSignUp: true }).api.signUpEmail({
      body: { email, password, name: 'Host' },
    });
    ownerId = await findOwnerId();
  }
  if (!ownerId) throw new Error('Owner account was not created');

  const [existing] = await db.select().from(groups).limit(1);
  const group = existing ?? (await createGroup({ name: groupName, ownerUserId: ownerId }));

  console.log(`${env.BETTER_AUTH_URL}/join/${group.inviteCode}`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
