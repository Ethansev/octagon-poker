import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { createGroup } from '@/groups/groups';
import { groups } from '@/groups/schema';
import { nightEvents, nights, seats } from '@/nights/schema';
import {
  addContact,
  addPlayer,
  getPlayer,
  listContacts,
  listPaymentHandles,
  listPlayers,
  mergePlayers,
  setHostPlayer,
  updateContact,
} from '@/players/players';
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

describe('player color slots', () => {
  async function slotsOf(groupId: string): Promise<number[]> {
    const rows = await db
      .select({ colorSlot: players.colorSlot })
      .from(players)
      .where(eq(players.groupId, groupId))
      .orderBy(players.createdAt);
    return rows.map((row) => row.colorSlot);
  }

  it('gives the first 16 players in a group distinct slots in order', async () => {
    const groupId = await newGroup();
    for (let i = 0; i < 16; i++) await newPlayer(groupId, `Player ${i}`);

    expect(await slotsOf(groupId)).toEqual(Array.from({ length: 16 }, (_, slot) => slot));
  });

  it('wraps the 17th player back to the first slot', async () => {
    const groupId = await newGroup();
    for (let i = 0; i < 16; i++) await newPlayer(groupId, `Player ${i}`);

    const result = await addPlayer({ groupId, name: 'Late arrival' });

    expect(result.kind === 'added' && result.player.colorSlot).toBe(0);
  });

  it('counts slots per group', async () => {
    const first = await newGroup('One');
    const second = await newGroup('Two');
    await newPlayer(first, 'Ivy');
    await newPlayer(first, 'Sid');

    const result = await addPlayer({ groupId: second, name: 'Dev' });

    expect(result.kind === 'added' && result.player.colorSlot).toBe(0);
  });

  it('gives concurrent new players different slots', async () => {
    const groupId = await newGroup();

    await Promise.all([
      addPlayer({ groupId, name: 'Ivy' }),
      addPlayer({ groupId, name: 'Sid' }),
      addPlayer({ groupId, name: 'Dev' }),
    ]);

    expect([...(await slotsOf(groupId))].sort()).toEqual([0, 1, 2]);
  });

  it('keeps the target slot on merge and reuses the freed slot', async () => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');

    await mergePlayers({ groupId, fromId, intoId });

    expect((await getPlayer(groupId, intoId))?.colorSlot).toBe(1);
    const next = await addPlayer({ groupId, name: 'Sid' });
    expect(next.kind === 'added' && next.player.colorSlot).toBe(0);
  });
});

describe('listPlayers and getPlayer', () => {
  it('lists players sorted by name and scopes getPlayer to the group', async () => {
    const groupId = await newGroup('One');
    const otherGroupId = await newGroup('Two');
    const zed = await newPlayer(groupId, 'Zed');
    await newPlayer(groupId, 'Amy');

    expect((await listPlayers(groupId)).map((p) => p.name)).toEqual(['Amy', 'Zed']);
    expect(await getPlayer(groupId, zed)).toEqual({ id: zed, groupId, name: 'Zed', colorSlot: 0 });
    expect(await getPlayer(otherGroupId, zed)).toBeNull();
  });
});

describe('contacts', () => {
  const blank = { venmo: '', zelle: '' };

  it('adds a player with payment info and keeps it off the plain player list', async () => {
    const groupId = await newGroup();

    const result = await addContact({ groupId, name: ' Ava  Stone ', venmo: '@ava', zelle: '' });

    expect(result).toEqual({ kind: 'saved' });
    const [contact] = await listContacts(groupId);
    expect(contact).toMatchObject({ name: 'Ava Stone', venmoHandle: 'ava', zelleHandle: null });
    const [player] = await listPlayers(groupId);
    expect(player).not.toHaveProperty('venmoHandle');
    expect(player).not.toHaveProperty('zelleHandle');
    expect(await getPlayer(groupId, player.id)).not.toHaveProperty('venmoHandle');
  });

  it.each([
    {
      name: 'a name already on the list',
      input: { name: 'IVY', ...blank },
      expected: { kind: 'name-taken' },
    },
    { name: 'a blank name', input: { name: '  ', ...blank }, expected: { kind: 'invalid-name' } },
    {
      name: 'a bad Venmo username',
      input: { name: 'Ava', venmo: 'not a username', zelle: '' },
      expected: { kind: 'invalid-handle', field: 'venmo' },
    },
  ])('refuses to add $name and creates nobody', async ({ input, expected }) => {
    const groupId = await newGroup();
    await newPlayer(groupId, 'Ivy');

    expect(await addContact({ groupId, ...input })).toEqual(expected);
    expect((await listContacts(groupId)).map((contact) => contact.name)).toEqual(['Ivy']);
  });

  it('updates a name and payment info, and can clear them', async () => {
    const groupId = await newGroup();
    const id = await newPlayer(groupId, 'Ivy');

    const saved = await updateContact({
      groupId,
      playerId: id,
      name: 'Ivy Bell',
      venmo: 'ivy',
      zelle: '415-555-0100',
    });
    expect(saved).toEqual({ kind: 'saved' });
    expect(await listPaymentHandles(groupId, [id])).toEqual({
      [id]: { venmoHandle: 'ivy', zelleHandle: '415-555-0100' },
    });

    await updateContact({ groupId, playerId: id, name: 'Ivy Bell', ...blank });
    const [contact] = await listContacts(groupId);
    expect(contact).toMatchObject({ name: 'Ivy Bell', venmoHandle: null, zelleHandle: null });
  });

  it('lets a player keep their name in a new case but not take someone else’s', async () => {
    const groupId = await newGroup();
    const ivy = await newPlayer(groupId, 'Ivy');
    await newPlayer(groupId, 'Sid');

    expect(await updateContact({ groupId, playerId: ivy, name: 'IVY', ...blank })).toEqual({
      kind: 'saved',
    });
    expect(await updateContact({ groupId, playerId: ivy, name: 'sid', ...blank })).toEqual({
      kind: 'name-taken',
    });
  });

  it('won’t touch a player from another group', async () => {
    const groupId = await newGroup();
    const otherGroupId = await newGroup('Saturday');
    const ivy = await newPlayer(groupId, 'Ivy');

    expect(
      await updateContact({ groupId: otherGroupId, playerId: ivy, name: 'Stolen', ...blank }),
    ).toEqual({ kind: 'not-found' });
    expect(await listPaymentHandles(otherGroupId, [ivy])).toEqual({});
  });
});

describe('setHostPlayer', () => {
  it('links and unlinks the host, and refuses a player from another group', async () => {
    const groupId = await newGroup();
    const otherGroupId = await newGroup('Saturday');
    const ivy = await newPlayer(groupId, 'Ivy');
    const host = async () =>
      (await db.select().from(groups).where(eq(groups.id, groupId)))[0].ownerPlayerId;

    expect(await setHostPlayer({ groupId, playerId: ivy })).toEqual({ kind: 'saved' });
    expect(await host()).toBe(ivy);
    expect(await setHostPlayer({ groupId: otherGroupId, playerId: ivy })).toEqual({
      kind: 'not-found',
    });
    expect(await setHostPlayer({ groupId, playerId: null })).toEqual({ kind: 'saved' });
    expect(await host()).toBeNull();
  });
});

describe('mergePlayers', () => {
  it.each([
    {
      name: 'fills the target’s blank handles from the source',
      from: { venmo: 'old-ivy', zelle: 'ivy@example.com' },
      into: { venmo: '', zelle: '' },
      expected: { venmoHandle: 'old-ivy', zelleHandle: 'ivy@example.com' },
    },
    {
      name: 'keeps the target’s handles when both have them',
      from: { venmo: 'old-ivy', zelle: 'old@example.com' },
      into: { venmo: 'ivy', zelle: '' },
      expected: { venmoHandle: 'ivy', zelleHandle: 'old@example.com' },
    },
  ])('$name', async ({ from, into, expected }) => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    await updateContact({ groupId, playerId: fromId, name: 'Ivy B', ...from });
    await updateContact({ groupId, playerId: intoId, name: 'Ivy', ...into });

    expect(await mergePlayers({ groupId, fromId, intoId })).toEqual({ kind: 'merged' });
    expect((await listPaymentHandles(groupId, [intoId]))[intoId]).toEqual(expected);
  });

  it('keeps the host linked when their player is merged away', async () => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    await setHostPlayer({ groupId, playerId: fromId });

    await mergePlayers({ groupId, fromId, intoId });

    const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
    expect(group.ownerPlayerId).toBe(intoId);
  });

  it('moves seats, the bank and activity-log actors to the target and removes the source', async () => {
    const groupId = await newGroup();
    const fromId = await newPlayer(groupId, 'Ivy B');
    const intoId = await newPlayer(groupId, 'Ivy');
    const nightId = await newNight(groupId, '2026-03-07');
    await db.insert(seats).values({ nightId, playerId: fromId, buyInCents: 2000 });
    await db.update(nights).set({ bankPlayerId: fromId }).where(eq(nights.id, nightId));
    await db
      .insert(nightEvents)
      .values({ nightId, actorKind: 'member', actorPlayerId: fromId, action: 'seat.added' });

    const result = await mergePlayers({ groupId, fromId, intoId });

    expect(result).toEqual({ kind: 'merged' });
    const seatRows = await db.select().from(seats);
    expect(seatRows.map((s) => s.playerId)).toEqual([intoId]);
    const eventRows = await db.select().from(nightEvents);
    expect(eventRows.map((e) => e.actorPlayerId)).toEqual([intoId]);
    const [night] = await db.select().from(nights);
    expect(night.bankPlayerId).toBe(intoId);
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
