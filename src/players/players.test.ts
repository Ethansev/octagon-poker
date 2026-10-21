import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { createGroup } from '@/groups/groups';
import { nightEvents, nights, seats } from '@/nights/schema';
import { addPlayer, getPlayer, listPlayers, mergePlayers } from '@/players/players';
import { players } from '@/players/schema';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(resetDb);

async function newGroup(name = 'Friday'): Promise<string> {
  const [owner] = await db
    .insert(user)
    .values({ id: `owner-${name}`, name: 'Host', email: `${name}@example.com` })
    .returning();
  const group = await createGroup({ name, ownerUserId: owner.id });
  return group.id;
}

async function newPlayer(groupId: string, name: string): Promise<string> {
  const result = await addPlayer({ groupId, name });
  if (result.kind !== 'added') throw new Error('expected added');
  return result.player.id;
}

async function newNight(groupId: string, date: string): Promise<string> {
  const [night] = await db.insert(nights).values({ groupId, date }).returning();
  return night.id;
}

describe('addPlayer', () => {
  it.each([
    { name: 'a new name is added', existing: null, input: 'Ivy', kind: 'added', stored: 'Ivy' },
    {
      name: 'a differently cased and padded name matches the existing player',
      existing: 'Ivy',
      input: 'ivy ',
      kind: 'exists',
      stored: 'Ivy',
    },
    {
      name: 'inner whitespace is collapsed before storing',
      existing: null,
      input: '  Mary   Jo ',
      kind: 'added',
      stored: 'Mary Jo',
    },
    {
      name: 'a blank name is rejected',
      existing: null,
      input: '   ',
      kind: 'invalid-name',
      stored: null,
    },
    {
      name: 'an empty name is rejected',
      existing: null,
      input: '',
      kind: 'invalid-name',
      stored: null,
    },
    {
      name: 'a name over 40 characters is rejected',
      existing: null,
      input: 'x'.repeat(41),
      kind: 'invalid-name',
      stored: null,
    },
    {
      name: 'a name of exactly 40 characters is accepted',
      existing: null,
      input: 'x'.repeat(40),
      kind: 'added',
      stored: 'x'.repeat(40),
    },
  ])('$name', async ({ existing, input, kind, stored }) => {
    const groupId = await newGroup();
    const existingId = existing === null ? null : await newPlayer(groupId, existing);

    const result = await addPlayer({ groupId, name: input });

    expect(result.kind).toBe(kind);
    if (result.kind === 'invalid-name') return;
    expect(result.player.name).toBe(stored);
    expect(result.player.groupId).toBe(groupId);
    if (existingId !== null) expect(result.player.id).toBe(existingId);
  });

  it('allows the same name in different groups', async () => {
    const first = await newGroup('One');
    const second = await newGroup('Two');
    await newPlayer(first, 'Ivy');

    const result = await addPlayer({ groupId: second, name: 'Ivy' });

    expect(result.kind).toBe('added');
  });

  it('resolves concurrent adds of the same name to one player', async () => {
    const groupId = await newGroup();

    const results = await Promise.all([
      addPlayer({ groupId, name: 'Ivy' }),
      addPlayer({ groupId, name: 'IVY' }),
    ]);

    expect(results.map((r) => r.kind).sort()).toEqual(['added', 'exists']);
    expect(await listPlayers(groupId)).toHaveLength(1);
  });
});

describe('listPlayers and getPlayer', () => {
  it('lists players sorted by name and scopes getPlayer to the group', async () => {
    const groupId = await newGroup('One');
    const otherGroupId = await newGroup('Two');
    const zed = await newPlayer(groupId, 'Zed');
    await newPlayer(groupId, 'Amy');

    expect((await listPlayers(groupId)).map((p) => p.name)).toEqual(['Amy', 'Zed']);
    expect(await getPlayer(groupId, zed)).toEqual({ id: zed, groupId, name: 'Zed' });
    expect(await getPlayer(otherGroupId, zed)).toBeNull();
  });
});

describe('mergePlayers', () => {
  it('moves seats and activity-log actors to the target and removes the source', async () => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    const nightId = await newNight(groupId, '2026-03-07');
    await db.insert(seats).values({ nightId, playerId: fromId, buyInCents: 2000 });
    await db
      .insert(nightEvents)
      .values({ nightId, actorKind: 'member', actorPlayerId: fromId, action: 'seat.added' });

    const result = await mergePlayers({ groupId, fromId, intoId });

    expect(result).toEqual({ kind: 'merged' });
    const seatRows = await db.select().from(seats);
    expect(seatRows.map((s) => s.playerId)).toEqual([intoId]);
    const eventRows = await db.select().from(nightEvents);
    expect(eventRows.map((e) => e.actorPlayerId)).toEqual([intoId]);
    expect(await db.select().from(players).where(eq(players.id, fromId))).toEqual([]);
  });

  it('refuses when both players sat in the same night and changes nothing', async () => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    const shared = await newNight(groupId, '2026-03-07');
    const other = await newNight(groupId, '2026-03-14');
    await db.insert(seats).values([
      { nightId: shared, playerId: fromId },
      { nightId: shared, playerId: intoId },
      { nightId: other, playerId: fromId },
    ]);

    const result = await mergePlayers({ groupId, fromId, intoId });

    expect(result).toEqual({ kind: 'same-night', dates: ['2026-03-07'] });
    const seatRows = await db.select().from(seats).where(eq(seats.playerId, fromId));
    expect(seatRows).toHaveLength(2);
    expect(await getPlayer(groupId, fromId)).not.toBeNull();
  });

  it('refuses to merge a player into itself', async () => {
    const groupId = await newGroup();
    const id = await newPlayer(groupId, 'Ivy');

    expect(await mergePlayers({ groupId, fromId: id, intoId: id })).toEqual({
      kind: 'same-player',
    });
  });

  it('returns not-found for an unknown id', async () => {
    const groupId = await newGroup();
    const id = await newPlayer(groupId, 'Ivy');

    expect(
      await mergePlayers({
        groupId,
        fromId: id,
        intoId: '00000000-0000-4000-8000-000000000000',
      }),
    ).toEqual({ kind: 'not-found' });
  });

  it('returns not-found when a player belongs to another group', async () => {
    const groupId = await newGroup('One');
    const otherGroupId = await newGroup('Two');
    const mine = await newPlayer(groupId, 'Ivy');
    const theirs = await newPlayer(otherGroupId, 'Ivy');

    expect(await mergePlayers({ groupId, fromId: theirs, intoId: mine })).toEqual({
      kind: 'not-found',
    });
    expect(await getPlayer(otherGroupId, theirs)).not.toBeNull();
  });
});
