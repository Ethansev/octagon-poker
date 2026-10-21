import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { MEMBER_COOKIE, PLAYER_COOKIE } from '@/access/cookies';
import { isMemberCode } from '@/access/invite';
import { getOwnerSession } from '@/auth/session';
import { db } from '@/db/client';
import { getGroup } from '@/groups/groups';
import type { Group } from '@/groups/schema';
import { players } from '@/players/schema';

export type Viewer =
  | { role: 'owner'; userId: string; group: Group }
  | { role: 'member'; group: Group; playerId: string | null };

export type Actor = { kind: 'owner' } | { kind: 'member'; playerId: string | null };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function playerInGroup(
  playerId: string | undefined,
  groupId: string,
): Promise<string | null> {
  if (playerId === undefined || !uuidPattern.test(playerId)) return null;
  const [player] = await db
    .select({ id: players.id })
    .from(players)
    .where(and(eq(players.id, playerId), eq(players.groupId, groupId)))
    .limit(1);
  return player?.id ?? null;
}

export async function getViewer(): Promise<Viewer | null> {
  await connection();
  const group = await getGroup();
  const owner = await getOwnerSession();
  if (owner) return { role: 'owner', userId: owner.userId, group };

  const jar = await cookies();
  if (!isMemberCode(jar.get(MEMBER_COOKIE)?.value, group.inviteCode)) return null;
  const playerId = await playerInGroup(jar.get(PLAYER_COOKIE)?.value, group.id);
  return { role: 'member', group, playerId };
}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new Error('Not allowed');
  return viewer;
}

export async function requireOwner(): Promise<Extract<Viewer, { role: 'owner' }>> {
  const viewer = await getViewer();
  if (viewer?.role !== 'owner') notFound();
  return viewer;
}

export function actorFor(viewer: Viewer): Actor {
  if (viewer.role === 'owner') return { kind: 'owner' };
  return { kind: 'member', playerId: viewer.playerId };
}
