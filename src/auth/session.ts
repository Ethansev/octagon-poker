import { auth } from '@/auth/auth';
import { getGroup } from '@/groups/groups';
import { headers } from 'next/headers';

export async function getOwnerSession(): Promise<{ userId: string } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const group = await getGroup();
  if (group.ownerUserId !== session.user.id) return null;
  return { userId: session.user.id };
}
