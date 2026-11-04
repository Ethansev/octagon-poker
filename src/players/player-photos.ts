import { db } from '@/db/client';
import { playerPhotos, players } from '@/players/schema';
import { and, eq } from 'drizzle-orm';

export type SavePhotoResult = { kind: 'saved' } | { kind: 'not-found' } | { kind: 'invalid-photo' };

const MAX_PHOTO_BYTES = 500 * 1024;

function isJpeg(bytes: Buffer): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

async function playerInGroup(groupId: string, playerId: string): Promise<boolean> {
  const [player] = await db
    .select({ id: players.id })
    .from(players)
    .where(and(eq(players.id, playerId), eq(players.groupId, groupId)));
  return Boolean(player);
}

export async function savePlayerPhoto(input: {
  groupId: string;
  playerId: string;
  jpeg: Buffer;
}): Promise<SavePhotoResult> {
  if (input.jpeg.length > MAX_PHOTO_BYTES || !isJpeg(input.jpeg)) return { kind: 'invalid-photo' };
  if (!(await playerInGroup(input.groupId, input.playerId))) return { kind: 'not-found' };

  const row = { jpeg: input.jpeg, updatedAt: new Date() };
  await db
    .insert(playerPhotos)
    .values({ playerId: input.playerId, ...row })
    .onConflictDoUpdate({ target: playerPhotos.playerId, set: row });
  return { kind: 'saved' };
}

export async function removePlayerPhoto(input: {
  groupId: string;
  playerId: string;
}): Promise<void> {
  if (!(await playerInGroup(input.groupId, input.playerId))) return;
  await db.delete(playerPhotos).where(eq(playerPhotos.playerId, input.playerId));
}

export async function getPlayerPhoto(groupId: string, playerId: string): Promise<Buffer | null> {
  const [photo] = await db
    .select({ jpeg: playerPhotos.jpeg })
    .from(playerPhotos)
    .innerJoin(players, eq(players.id, playerPhotos.playerId))
    .where(and(eq(playerPhotos.playerId, playerId), eq(players.groupId, groupId)));
  return photo?.jpeg ?? null;
}

export async function listPlayerPhotoUrls(groupId: string): Promise<Record<string, string>> {
  const rows = await db
    .select({ id: players.id, name: players.name, updatedAt: playerPhotos.updatedAt })
    .from(playerPhotos)
    .innerJoin(players, eq(players.id, playerPhotos.playerId))
    .where(eq(players.groupId, groupId));
  return Object.fromEntries(
    rows.map((row) => [
      row.name.toLowerCase(),
      `/players/${row.id}/photo?v=${row.updatedAt.getTime()}`,
    ]),
  );
}
