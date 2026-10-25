import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { groups } from '@/groups/schema';
import { nights, seats } from '@/nights/schema';
import { players } from '@/players/schema';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(resetDb);

describe('schema constraints', () => {
  it('rejects a second player whose name differs only by case', async () => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    await db.insert(players).values({ groupId: group.id, name: 'Ivy', colorSlot: 0 });
    await expect(
      db.insert(players).values({ groupId: group.id, name: 'ivy', colorSlot: 1 }),
    ).rejects.toThrow();
  });

  it.each([
    { name: 'a color slot below the palette is rejected', colorSlot: -1 },
    { name: 'a color slot past the palette is rejected', colorSlot: 16 },
  ])('$name', async ({ colorSlot }) => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    await expect(
      db.insert(players).values({ groupId: group.id, name: 'Ivy', colorSlot }),
    ).rejects.toThrow();
  });

  it('rejects a negative buy-in on a seat', async () => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    const [player] = await db
      .insert(players)
      .values({ groupId: group.id, name: 'Ivy', colorSlot: 0 })
      .returning();
    const [night] = await db
      .insert(nights)
      .values({ groupId: group.id, date: '2026-01-02' })
      .returning();
    await expect(
      db.insert(seats).values({ nightId: night.id, playerId: player.id, buyInCents: -1 }),
    ).rejects.toThrow();
  });
});
