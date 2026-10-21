import { generateInviteCode } from '@/access/invite';
import { db } from '@/db/client';
import { groups, type Group } from '@/groups/schema';
import { eq } from 'drizzle-orm';

export async function getGroup(): Promise<Group> {
  const [group] = await db.select().from(groups).limit(1);
  if (!group) throw new Error('No group yet. Run npm run setup.');
  return group;
}

export async function createGroup(input: { name: string; ownerUserId: string }): Promise<Group> {
  const [group] = await db
    .insert(groups)
    .values({ name: input.name, ownerUserId: input.ownerUserId, inviteCode: generateInviteCode() })
    .returning();
  return group;
}

export async function resetInviteCode(groupId: string): Promise<string> {
  const inviteCode = generateInviteCode();
  await db.update(groups).set({ inviteCode }).where(eq(groups.id, groupId));
  return inviteCode;
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  await db.update(groups).set({ name }).where(eq(groups.id, groupId));
}
