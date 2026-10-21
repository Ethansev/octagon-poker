import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { groups } from '@/groups/schema';
import { nights, seats } from '@/nights/schema';
import { players } from '@/players/schema';

beforeEach(resetDb);

describe('schema constraints', () => {
  it('rejects a second player whose name differs only by case', async () => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    await db.insert(players).values({ groupId: group.id, name: 'Ivy' });
    await expect(db.insert(players).values({ groupId: group.id, name: 'ivy' })).rejects.toThrow();
  });

  it('rejects a negative buy-in on a seat', async () => {
    const [group] = await db.insert(groups).values({ name: 'G', inviteCode: 'code-1' }).returning();
    const [player] = await db.insert(players).values({ groupId: group.id, name: 'Ivy' }).returning();
    const [night] = await db
      .insert(nights)
      .values({ groupId: group.id, date: '2026-01-02' })
      .returning();
    await expect(
      db.insert(seats).values({ nightId: night.id, playerId: player.id, buyInCents: -1 }),
    ).rejects.toThrow();
  });
});
