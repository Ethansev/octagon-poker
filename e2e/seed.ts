import { resetDb } from '@/db/test-db';
import { setupOwnerGroup } from '@/groups/setup';

export const HOST = { email: 'host@example.com', password: 'e2e-host-password' };

export async function seedGroup(): Promise<{ inviteCode: string }> {
  await resetDb();
  const group = await setupOwnerGroup({ ...HOST, groupName: 'E2E Poker' });
  return { inviteCode: group.inviteCode };
}
