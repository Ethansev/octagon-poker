import { isMemberCode } from '@/access/invite';
import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { createGroup, getGroup, renameGroup, resetInviteCode } from '@/groups/groups';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(resetDb);

async function insertOwner(): Promise<string> {
  const [owner] = await db
    .insert(user)
    .values({ id: 'owner-1', name: 'Host', email: 'owner@example.com' })
    .returning();
  return owner.id;
}

describe('getGroup', () => {
  it('points at the setup script when no group exists', async () => {
    await expect(getGroup()).rejects.toThrow('No group yet. Run npm run setup.');
  });
});

describe('resetInviteCode', () => {
  it('persists a new code and invalidates the old one', async () => {
    const created = await createGroup({ name: 'Friday', ownerUserId: await insertOwner() });
    const next = await resetInviteCode(created.id);
    const stored = await getGroup();

    expect(next).not.toBe(created.inviteCode);
    expect(stored.inviteCode).toBe(next);
    expect(isMemberCode(created.inviteCode, stored.inviteCode)).toBe(false);
    expect(isMemberCode(next, stored.inviteCode)).toBe(true);
  });
});

describe('renameGroup', () => {
  it('changes the stored name', async () => {
    const created = await createGroup({ name: 'Friday', ownerUserId: await insertOwner() });
    await renameGroup(created.id, 'Saturday');
    expect((await getGroup()).name).toBe('Saturday');
  });
});
