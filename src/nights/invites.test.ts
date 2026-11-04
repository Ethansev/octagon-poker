import type { Actor } from '@/access/viewer';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { newGroup } from '@/groups/test-group';
import {
  addComment,
  listComments,
  listRsvps,
  removeComment,
  seesNightDetails,
  setRsvp,
} from '@/nights/invites';
import { closeNight, createNight, setBank, upsertSeat } from '@/nights/nights';
import { nightRsvps } from '@/nights/schema';
import { addPlayer, mergePlayers } from '@/players/players';
import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(resetDb);

const owner: Actor = { kind: 'owner' };

async function newPlayer(groupId: string, name: string): Promise<string> {
  const result = await addPlayer({ groupId, name });
  if (result.kind !== 'added') throw new Error('expected added');
  return result.player.id;
}

async function setup() {
  const groupId = await newGroup();
  const ava = await newPlayer(groupId, 'Ava');
  const ben = await newPlayer(groupId, 'Ben');
  const { id: nightId } = await createNight(
    { groupId, date: '2026-11-21', location: 'Sid’s', buyInCents: 2000 },
    owner,
  );
  return { groupId, ava, ben, nightId };
}

async function close(groupId: string, nightId: string, playerId: string) {
  await upsertSeat(
    { groupId, nightId, playerId, buyInCents: 2000, cashOutCents: 2000, expectedUpdatedAt: null },
    owner,
  );
  await setBank({ groupId, nightId, playerId }, owner);
  await closeNight(groupId, nightId);
}

describe('replies', () => {
  it('records a reply and lets someone change their mind', async () => {
    const { groupId, ava, nightId } = await setup();

    await setRsvp({ groupId, nightId, playerId: ava, response: 'maybe' });
    await setRsvp({ groupId, nightId, playerId: ava, response: 'going' });

    expect((await listRsvps(nightId)).map((r) => [r.name, r.response])).toEqual([['Ava', 'going']]);
  });

  it('keeps people in the order they said yes, and a repeat tap doesn’t lose a place', async () => {
    const { groupId, ava, ben, nightId } = await setup();

    await setRsvp({ groupId, nightId, playerId: ava, response: 'going' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setRsvp({ groupId, nightId, playerId: ben, response: 'going' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setRsvp({ groupId, nightId, playerId: ava, response: 'going' });

    expect((await listRsvps(nightId)).map((r) => r.name)).toEqual(['Ava', 'Ben']);
  });

  it('sends someone to the back if they back out and return', async () => {
    const { groupId, ava, ben, nightId } = await setup();

    await setRsvp({ groupId, nightId, playerId: ava, response: 'going' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setRsvp({ groupId, nightId, playerId: ben, response: 'going' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setRsvp({ groupId, nightId, playerId: ava, response: 'out' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setRsvp({ groupId, nightId, playerId: ava, response: 'going' });

    expect((await listRsvps(nightId)).map((r) => r.name)).toEqual(['Ben', 'Ava']);
  });

  it('refuses a closed night', async () => {
    const { groupId, ava, nightId } = await setup();
    await close(groupId, nightId, ava);

    expect(await setRsvp({ groupId, nightId, playerId: ava, response: 'going' })).toEqual({
      kind: 'night-closed',
    });
  });

  it('refuses a player or night from another group', async () => {
    const { groupId, ava, nightId } = await setup();
    const otherGroupId = await newGroup('Saturday');
    const stranger = await newPlayer(otherGroupId, 'Stranger');

    expect(await setRsvp({ groupId, nightId, playerId: stranger, response: 'going' })).toEqual({
      kind: 'not-found',
    });
    expect(
      await setRsvp({ groupId: otherGroupId, nightId, playerId: ava, response: 'going' }),
    ).toEqual({ kind: 'not-found' });
  });

  it('doesn’t stop a night closing when someone who said yes never sat down', async () => {
    const { groupId, ava, ben, nightId } = await setup();
    await setRsvp({ groupId, nightId, playerId: ben, response: 'going' });
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ava,
        buyInCents: 2000,
        cashOutCents: 2000,
        expectedUpdatedAt: null,
      },
      owner,
    );
    await setBank({ groupId, nightId, playerId: ava }, owner);

    expect((await closeNight(groupId, nightId)).kind).toBe('closed');
  });
});

describe('comments', () => {
  it('lists comments oldest first, trimmed, with the host shown as nobody’s player', async () => {
    const { groupId, ava, nightId } = await setup();

    await addComment({ groupId, nightId, playerId: ava, body: '  See you there  ' });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await addComment({ groupId, nightId, playerId: null, body: 'Doors at 8' });

    expect((await listComments(nightId)).map((c) => [c.name, c.body])).toEqual([
      ['Ava', 'See you there'],
      [null, 'Doors at 8'],
    ]);
  });

  it.each([
    { name: 'a blank comment', body: '   ' },
    { name: 'a comment over the limit', body: 'a'.repeat(501) },
  ])('refuses $name', async ({ body }) => {
    const { groupId, ava, nightId } = await setup();

    expect(await addComment({ groupId, nightId, playerId: ava, body })).toEqual({
      kind: 'invalid-body',
    });
    expect(await listComments(nightId)).toEqual([]);
  });

  it('still allows comments after a night closes', async () => {
    const { groupId, ava, nightId } = await setup();
    await close(groupId, nightId, ava);

    expect(await addComment({ groupId, nightId, playerId: ava, body: 'GG' })).toEqual({
      kind: 'saved',
    });
  });

  it('lets the author or the host delete, and nobody else', async () => {
    const { groupId, ava, ben, nightId } = await setup();
    await addComment({ groupId, nightId, playerId: ava, body: 'One' });
    await addComment({ groupId, nightId, playerId: ava, body: 'Two' });
    await addComment({ groupId, nightId, playerId: null, body: 'From the host' });
    const [one, two, host] = await listComments(nightId);
    const del = (commentId: string, actor: Actor) =>
      removeComment({ groupId, nightId, commentId }, actor);

    expect(await del(one.id, { kind: 'member', playerId: ben })).toEqual({ kind: 'not-allowed' });
    expect(await del(host.id, { kind: 'member', playerId: null })).toEqual({
      kind: 'not-allowed',
    });
    expect(await del(one.id, { kind: 'member', playerId: ava })).toEqual({ kind: 'removed' });
    expect(await del(two.id, owner)).toEqual({ kind: 'removed' });
    expect((await listComments(nightId)).map((c) => c.body)).toEqual(['From the host']);
  });
});

describe('merging players', () => {
  it('moves comments and replies, keeping the target’s reply on a shared night', async () => {
    const { groupId, ava: fromId, ben: intoId, nightId } = await setup();
    const { id: otherNight } = await createNight(
      { groupId, date: '2026-11-28', location: null, buyInCents: null },
      owner,
    );
    await addComment({ groupId, nightId, playerId: fromId, body: 'Hello' });
    await setRsvp({ groupId, nightId, playerId: fromId, response: 'out' });
    await setRsvp({ groupId, nightId, playerId: intoId, response: 'going' });
    await setRsvp({ groupId, nightId: otherNight, playerId: fromId, response: 'maybe' });

    expect(await mergePlayers({ groupId, fromId, intoId })).toEqual({ kind: 'merged' });

    expect((await listComments(nightId))[0].playerId).toBe(intoId);
    expect((await listRsvps(nightId)).map((r) => [r.playerId, r.response])).toEqual([
      [intoId, 'going'],
    ]);
    expect((await listRsvps(otherNight)).map((r) => [r.playerId, r.response])).toEqual([
      [intoId, 'maybe'],
    ]);
    expect(await db.select().from(nightRsvps)).toHaveLength(2);
  });
});

describe('seesNightDetails', () => {
  const rsvps = [
    { playerId: 'ava', response: 'going' },
    { playerId: 'ben', response: 'maybe' },
  ] satisfies { playerId: string; response: 'going' | 'maybe' }[];

  it.each([
    { name: 'the host, without replying', role: 'owner', playerId: null, expected: true },
    { name: 'someone who said they’re in', role: 'member', playerId: 'ava', expected: true },
    { name: 'someone who said maybe', role: 'member', playerId: 'ben', expected: false },
    { name: 'someone who hasn’t replied', role: 'member', playerId: 'cal', expected: false },
    { name: 'someone with no name picked', role: 'member', playerId: null, expected: false },
  ] satisfies {
    name: string;
    role: 'owner' | 'member';
    playerId: string | null;
    expected: boolean;
  }[])('$name', ({ role, playerId, expected }) => {
    expect(seesNightDetails({ role, playerId }, rsvps)).toBe(expected);
  });
});
