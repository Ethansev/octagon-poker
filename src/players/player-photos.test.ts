import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { newGroup } from '@/groups/test-group';
import {
  getPlayerPhoto,
  listPlayerPhotoUrls,
  removePlayerPhoto,
  savePlayerPhoto,
} from '@/players/player-photos';
import { addPlayer, mergePlayers } from '@/players/players';
import { playerPhotos } from '@/players/schema';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(resetDb);

const jpeg = (fill = 1) => Buffer.from([0xff, 0xd8, 0xff, 0xe0, fill]);

async function newPlayer(groupId: string, name: string): Promise<string> {
  const result = await addPlayer({ groupId, name });
  if (result.kind !== 'added') throw new Error('expected added');
  return result.player.id;
}

describe('player photos', () => {
  it('saves, replaces and removes a photo', async () => {
    const groupId = await newGroup();
    const ivy = await newPlayer(groupId, 'Ivy');

    expect(await savePlayerPhoto({ groupId, playerId: ivy, jpeg: jpeg(1) })).toEqual({
      kind: 'saved',
    });
    expect((await getPlayerPhoto(groupId, ivy))?.equals(jpeg(1))).toBe(true);

    await savePlayerPhoto({ groupId, playerId: ivy, jpeg: jpeg(2) });
    expect((await getPlayerPhoto(groupId, ivy))?.equals(jpeg(2))).toBe(true);
    expect(await db.select().from(playerPhotos)).toHaveLength(1);

    await removePlayerPhoto({ groupId, playerId: ivy });
    expect(await getPlayerPhoto(groupId, ivy)).toBeNull();
  });

  it.each([
    { name: 'something that isn’t a JPEG', bytes: Buffer.from('<svg onload="alert(1)"/>') },
    { name: 'an empty file', bytes: Buffer.alloc(0) },
    {
      name: 'a file over the size limit',
      bytes: Buffer.concat([jpeg(), Buffer.alloc(500 * 1024)]),
    },
  ])('refuses $name', async ({ bytes }) => {
    const groupId = await newGroup();
    const ivy = await newPlayer(groupId, 'Ivy');

    expect(await savePlayerPhoto({ groupId, playerId: ivy, jpeg: bytes })).toEqual({
      kind: 'invalid-photo',
    });
    expect(await getPlayerPhoto(groupId, ivy)).toBeNull();
  });

  it('keeps each group to its own players', async () => {
    const groupId = await newGroup();
    const otherGroupId = await newGroup('Saturday');
    const ivy = await newPlayer(groupId, 'Ivy');
    await savePlayerPhoto({ groupId, playerId: ivy, jpeg: jpeg() });

    expect(await savePlayerPhoto({ groupId: otherGroupId, playerId: ivy, jpeg: jpeg(2) })).toEqual({
      kind: 'not-found',
    });
    expect(await getPlayerPhoto(otherGroupId, ivy)).toBeNull();
    await removePlayerPhoto({ groupId: otherGroupId, playerId: ivy });
    expect(await getPlayerPhoto(groupId, ivy)).not.toBeNull();
    expect(await listPlayerPhotoUrls(otherGroupId)).toEqual({});
  });

  it('lists a URL by lowercased name that changes with each new photo', async () => {
    const groupId = await newGroup();
    const ivy = await newPlayer(groupId, 'Ivy Bell');
    await newPlayer(groupId, 'No Photo');
    await savePlayerPhoto({ groupId, playerId: ivy, jpeg: jpeg(1) });

    const first = await listPlayerPhotoUrls(groupId);
    expect(Object.keys(first)).toEqual(['ivy bell']);
    expect(first['ivy bell']).toMatch(new RegExp(`^/players/${ivy}/photo\\?v=\\d+$`));

    await new Promise((resolve) => setTimeout(resolve, 5));
    await savePlayerPhoto({ groupId, playerId: ivy, jpeg: jpeg(2) });
    expect((await listPlayerPhotoUrls(groupId))['ivy bell']).not.toBe(first['ivy bell']);
  });

  it.each([
    { name: 'moves the photo when the target has none', targetHasPhoto: false, expected: 1 },
    { name: 'keeps the target’s photo when both have one', targetHasPhoto: true, expected: 2 },
  ])('merging $name', async ({ targetHasPhoto, expected }) => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    await savePlayerPhoto({ groupId, playerId: fromId, jpeg: jpeg(1) });
    if (targetHasPhoto) await savePlayerPhoto({ groupId, playerId: intoId, jpeg: jpeg(2) });

    expect(await mergePlayers({ groupId, fromId, intoId })).toEqual({ kind: 'merged' });

    expect((await getPlayerPhoto(groupId, intoId))?.equals(jpeg(expected))).toBe(true);
    expect(await db.select().from(playerPhotos)).toHaveLength(1);
  });
});
