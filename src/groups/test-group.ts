import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { createGroup } from '@/groups/groups';

export async function newGroup(name = 'Friday'): Promise<string> {
  const [owner] = await db
    .insert(user)
    .values({ id: `owner-${name}`, name: 'Host', email: `${name}@example.com` })
    .returning();
  const group = await createGroup({ name, ownerUserId: owner.id });
  return group.id;
}
