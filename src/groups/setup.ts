import { createAuth } from '@/auth/auth';
import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { createGroup } from '@/groups/groups';
import { groups, type Group } from '@/groups/schema';
import { eq } from 'drizzle-orm';

export type OwnerSetup = { email: string; password: string; groupName: string };

export function readOwnerSetup(vars: Record<string, string | undefined>): OwnerSetup | null {
  const password = vars.OWNER_PASSWORD;
  if (!password) return null;
  const email = vars.OWNER_EMAIL;
  const groupName = vars.GROUP_NAME;
  if (!email) throw new Error('OWNER_EMAIL is not set');
  if (!groupName) throw new Error('GROUP_NAME is not set');
  return { email, password, groupName };
}

async function findUserId(email: string): Promise<string | null> {
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  return owner?.id ?? null;
}

export async function setupOwnerGroup(setup: OwnerSetup): Promise<Group> {
  let ownerId = await findUserId(setup.email);
  if (!ownerId) {
    await createAuth({ allowSignUp: true }).api.signUpEmail({
      body: { email: setup.email, password: setup.password, name: 'Host' },
    });
    ownerId = await findUserId(setup.email);
  }
  if (!ownerId) throw new Error('Owner account was not created');

  const [existing] = await db.select().from(groups).limit(1);
  return existing ?? createGroup({ name: setup.groupName, ownerUserId: ownerId });
}
