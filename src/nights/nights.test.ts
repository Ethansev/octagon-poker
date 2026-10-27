import type { Actor } from '@/access/viewer';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { newGroup } from '@/groups/test-group';
import {
  closeNight,
  createNight,
  deleteNight,
  getNight,
  listClosedNights,
  listNights,
  listOutstandingPayouts,
  markPaid,
  removeSeat,
  reopenNight,
  setBank,
  updateNight,
  upsertSeat,
} from '@/nights/nights';
import { nightEvents, nights, seats } from '@/nights/schema';
import { addPlayer } from '@/players/players';
import { eq } from 'drizzle-orm';
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
  const ann = await newPlayer(groupId, 'Ann');
  const ivy = await newPlayer(groupId, 'Ivy');
  const { id: nightId } = await createNight(
    { groupId, date: '2026-03-07', location: 'Ann’s', buyInCents: 2000 },
    owner,
  );
  return { groupId, ann, ivy, nightId };
}

async function seat(
  groupId: string,
  nightId: string,
  playerId: string,
  buyInCents: number,
  cashOutCents: number | null,
) {
  const result = await upsertSeat(
    { groupId, nightId, playerId, buyInCents, cashOutCents, expectedUpdatedAt: null },
    owner,
  );
  if (result.kind !== 'saved') throw new Error('expected saved');
  return result.updatedAt;
}

async function closeWithBank(groupId: string, nightId: string, bankId: string) {
  expect(await setBank({ groupId, nightId, playerId: bankId }, owner)).toEqual({ kind: 'set' });
  const result = await closeNight(groupId, nightId);
  if (result.kind !== 'closed') throw new Error('expected closed');
  return result;
}

function current(view: { buyInCents: number; cashOutCents: number | null }) {
  return { buyInCents: view.buyInCents, cashOutCents: view.cashOutCents };
}

describe('seating', () => {
  it('returns seats with names and logs each change against the member actor', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    const member: Actor = { kind: 'member', playerId: ann };

    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 2000,
        cashOutCents: null,
        expectedUpdatedAt: null,
      },
      member,
    );
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ann,
        buyInCents: 4000,
        cashOutCents: 5000,
        expectedUpdatedAt: null,
      },
      member,
    );

    const night = await getNight(groupId, nightId);
    expect(night?.seats.map((s) => [s.playerName, s.buyInCents, s.cashOutCents])).toEqual([
      ['Ann', 4000, 5000],
      ['Ivy', 2000, null],
    ]);
    const memberEvents = night?.events.filter((e) => e.actorKind === 'member');
    expect(memberEvents?.map((e) => [e.action, e.actorName])).toEqual([
      ['seat.add', 'Ann'],
      ['seat.add', 'Ann'],
    ]);
    expect(night?.events.at(-1)?.action).toBe('night.create');
    expect(night?.events.at(-1)?.actorName).toBeNull();
  });

  it('gives a stale second editor a conflict with the current values and keeps the first write', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    const t1 = await seat(groupId, nightId, ivy, 2000, null);

    const ownerSave = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 2000,
        cashOutCents: 2600,
        expectedUpdatedAt: t1,
      },
      owner,
    );
    expect(ownerSave.kind).toBe('saved');

    const stale = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 3000,
        cashOutCents: 1000,
        expectedUpdatedAt: t1,
      },
      { kind: 'member', playerId: ann },
    );

    expect(stale.kind).toBe('conflict');
    if (stale.kind !== 'conflict') return;
    expect(current(stale.current)).toEqual({ buyInCents: 2000, cashOutCents: 2600 });
    const [row] = await db.select().from(seats).where(eq(seats.playerId, ivy));
    expect(current(row)).toEqual({ buyInCents: 2000, cashOutCents: 2600 });
  });

  it('accepts the updatedAt it returned on the next save despite microsecond storage', async () => {
    const { groupId, ivy, nightId } = await setup();
    let updatedAt = await seat(groupId, nightId, ivy, 2000, null);

    for (let i = 1; i <= 5; i += 1) {
      const result = await upsertSeat(
        {
          groupId,
          nightId,
          playerId: ivy,
          buyInCents: 2000 + i,
          cashOutCents: null,
          expectedUpdatedAt: updatedAt,
        },
        owner,
      );
      expect(result.kind).toBe('saved');
      if (result.kind === 'saved') updatedAt = result.updatedAt;
    }
  });

  it('issues a strictly newer token even when the previous write is ahead of the clock', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    const t1 = await seat(groupId, nightId, ivy, 2000, null);
    const future = new Date(t1.getTime() + 60_000);
    await db.update(seats).set({ updatedAt: future }).where(eq(seats.playerId, ivy));

    const ownerSave = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 2000,
        cashOutCents: 2600,
        expectedUpdatedAt: future,
      },
      owner,
    );
    expect(ownerSave.kind).toBe('saved');
    if (ownerSave.kind !== 'saved') return;
    expect(ownerSave.updatedAt.getTime()).toBeGreaterThan(future.getTime());

    const stale = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 3000,
        cashOutCents: 1000,
        expectedUpdatedAt: future,
      },
      { kind: 'member', playerId: ann },
    );
    expect(stale.kind).toBe('conflict');
    const [row] = await db.select().from(seats).where(eq(seats.playerId, ivy));
    expect(current(row)).toEqual({ buyInCents: 2000, cashOutCents: 2600 });
  });

  it('treats creating a seat that already exists as a conflict', async () => {
    const { groupId, ivy, nightId } = await setup();
    await seat(groupId, nightId, ivy, 2000, 2500);

    const result = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 100,
        cashOutCents: null,
        expectedUpdatedAt: null,
      },
      owner,
    );

    expect(result.kind).toBe('conflict');
    if (result.kind === 'conflict') {
      expect(current(result.current)).toEqual({ buyInCents: 2000, cashOutCents: 2500 });
    }
  });

  it('removes a seat and logs it, and reports not-found for a missing seat', async () => {
    const { groupId, ivy, nightId } = await setup();
    await seat(groupId, nightId, ivy, 2000, null);

    expect(await removeSeat({ groupId, nightId, playerId: ivy }, owner)).toEqual({
      kind: 'removed',
    });
    expect(await removeSeat({ groupId, nightId, playerId: ivy }, owner)).toEqual({
      kind: 'not-found',
    });
    const night = await getNight(groupId, nightId);
    expect(night?.seats).toEqual([]);
    expect(night?.events[0].action).toBe('seat.remove');
  });

  it('records night edits and refuses a player or night from another group', async () => {
    const { groupId, ivy, nightId } = await setup();
    const otherGroup = await newGroup('Other');
    const outsider = await newPlayer(otherGroup, 'Zed');

    expect(
      await upsertSeat(
        {
          groupId,
          nightId,
          playerId: outsider,
          buyInCents: 1,
          cashOutCents: null,
          expectedUpdatedAt: null,
        },
        owner,
      ),
    ).toEqual({ kind: 'not-found' });
    expect(
      await upsertSeat(
        {
          groupId: otherGroup,
          nightId,
          playerId: ivy,
          buyInCents: 1,
          cashOutCents: null,
          expectedUpdatedAt: null,
        },
        owner,
      ),
    ).toEqual({ kind: 'not-found' });
    expect(
      await updateNight(
        { groupId: otherGroup, nightId, date: '2026-04-01', location: null, buyInCents: null },
        owner,
      ),
    ).toEqual({ kind: 'not-found' });
    expect(await closeNight(otherGroup, nightId)).toEqual({ kind: 'not-found' });
    expect(await reopenNight(otherGroup, nightId)).toEqual({ kind: 'not-found' });
    expect(await deleteNight(otherGroup, nightId)).toEqual({ kind: 'not-found' });
    expect(await getNight(otherGroup, nightId)).toBeNull();

    expect(
      await updateNight(
        { groupId, nightId, date: '2026-03-08', location: 'Ivy’s', buyInCents: 1000 },
        owner,
      ),
    ).toEqual({ kind: 'saved' });
    const night = await getNight(groupId, nightId);
    expect(night).toMatchObject({ date: '2026-03-08', location: 'Ivy’s', buyInCents: 1000 });
    expect(night?.events[0]).toMatchObject({ action: 'night.update' });
  });
});

describe('closing', () => {
  it('requires every cash-out and matching totals, then locks the night', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, null);

    expect(await closeNight(groupId, nightId)).toEqual({
      kind: 'not-balanced',
      balance: { kind: 'missing-cash-out', playerIds: [ivy] },
    });

    const annSeat = (await getNight(groupId, nightId))?.seats.find((s) => s.playerId === ann);
    if (!annSeat) throw new Error('missing seat');
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ann,
        buyInCents: 6000,
        cashOutCents: 5800,
        expectedUpdatedAt: annSeat.updatedAt,
      },
      owner,
    );
    const ivySeat = (await getNight(groupId, nightId))?.seats.find((s) => s.playerId === ivy);
    if (!ivySeat) throw new Error('missing seat');
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 2000,
        cashOutCents: 2000,
        expectedUpdatedAt: ivySeat.updatedAt,
      },
      owner,
    );
    expect(await closeNight(groupId, nightId)).toEqual({
      kind: 'not-balanced',
      balance: { kind: 'off', inCents: 8000, outCents: 7800 },
    });
  });

  it('closes a balanced night with winners, then rejects every edit and logs the close', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 1000);

    expect((await closeWithBank(groupId, nightId, ivy)).winners).toEqual([ann]);

    expect(
      await upsertSeat(
        {
          groupId,
          nightId,
          playerId: ivy,
          buyInCents: 1,
          cashOutCents: null,
          expectedUpdatedAt: null,
        },
        owner,
      ),
    ).toEqual({ kind: 'night-closed' });
    expect(await removeSeat({ groupId, nightId, playerId: ivy }, owner)).toEqual({
      kind: 'night-closed',
    });
    expect(
      await updateNight(
        { groupId, nightId, date: '2026-03-09', location: null, buyInCents: null },
        owner,
      ),
    ).toEqual({ kind: 'night-closed' });

    const night = await getNight(groupId, nightId);
    expect(night?.status).toBe('closed');
    expect(night?.winners).toEqual([ann]);
    expect(night?.events[0]).toMatchObject({ action: 'night.close', detail: { winners: [ann] } });
  });

  it('reports an empty night as not balanced', async () => {
    const { groupId, nightId } = await setup();

    expect(await closeNight(groupId, nightId)).toEqual({
      kind: 'not-balanced',
      balance: { kind: 'empty' },
    });
  });

  it('reopens so seats can be edited again, with no winners while open', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 1000);
    await closeWithBank(groupId, nightId, ann);

    expect(await reopenNight(groupId, nightId)).toEqual({ kind: 'reopened' });

    const night = await getNight(groupId, nightId);
    expect(night?.status).toBe('open');
    expect(night?.winners).toEqual([]);
    expect(night?.events[0].action).toBe('night.reopen');
    const annSeat = night?.seats.find((s) => s.playerId === ann);
    if (!annSeat) throw new Error('missing seat');
    const result = await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ann,
        buyInCents: 2000,
        cashOutCents: 3000,
        expectedUpdatedAt: annSeat.updatedAt,
      },
      owner,
    );
    expect(result.kind).toBe('saved');
  });
});

describe('the bank', () => {
  it('records a seated player as the bank and logs the change', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, null);
    await seat(groupId, nightId, ivy, 2000, null);
    const member: Actor = { kind: 'member', playerId: ivy };

    expect(await setBank({ groupId, nightId, playerId: ann }, member)).toEqual({ kind: 'set' });
    expect(await setBank({ groupId, nightId, playerId: ivy }, member)).toEqual({ kind: 'set' });

    const night = await getNight(groupId, nightId);
    expect(night?.bankPlayerId).toBe(ivy);
    expect(night?.events.slice(0, 2)).toMatchObject([
      { action: 'night.bank', actorName: 'Ivy', detail: { before: ann, after: ivy } },
      { action: 'night.bank', detail: { before: null, after: ann } },
    ]);
  });

  it('refuses a player who is not at the table or a night from another group', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, null);
    const otherGroup = await newGroup('Other');

    expect(await setBank({ groupId, nightId, playerId: ivy }, owner)).toEqual({
      kind: 'not-seated',
    });
    expect(await setBank({ groupId: otherGroup, nightId, playerId: ann }, owner)).toEqual({
      kind: 'not-found',
    });
    expect((await getNight(groupId, nightId))?.bankPlayerId).toBeNull();
  });

  it('will not close a balanced night until someone holds the bank', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 1000);

    expect(await closeNight(groupId, nightId)).toEqual({ kind: 'no-bank' });
    expect((await getNight(groupId, nightId))?.status).toBe('open');
    expect((await closeWithBank(groupId, nightId, ann)).winners).toEqual([ann]);
  });

  it('clears the bank when the bank leaves the table', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, null);
    await seat(groupId, nightId, ivy, 2000, null);
    await setBank({ groupId, nightId, playerId: ann }, owner);

    await removeSeat({ groupId, nightId, playerId: ivy }, owner);
    expect((await getNight(groupId, nightId))?.bankPlayerId).toBe(ann);
    await removeSeat({ groupId, nightId, playerId: ann }, owner);
    expect((await getNight(groupId, nightId))?.bankPlayerId).toBeNull();
  });

  it('locks the bank once the night is closed', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 1000);
    await closeWithBank(groupId, nightId, ann);

    expect(await setBank({ groupId, nightId, playerId: ivy }, owner)).toEqual({
      kind: 'night-closed',
    });
  });
});

describe('pay-outs', () => {
  async function closedNight() {
    const base = await setup();
    const { groupId, ann, ivy, nightId } = base;
    const bo = await newPlayer(groupId, 'Bo');
    const zed = await newPlayer(groupId, 'Zed');
    await seat(groupId, nightId, ann, 2000, 3500);
    await seat(groupId, nightId, ivy, 2000, 1000);
    await seat(groupId, nightId, bo, 2000, 0);
    await seat(groupId, nightId, zed, 2000, 3500);
    await closeWithBank(groupId, nightId, zed);
    return { ...base, bo, zed };
  }

  async function seatOf(groupId: string, nightId: string, playerId: string) {
    const found = (await getNight(groupId, nightId))?.seats.find((s) => s.playerId === playerId);
    if (!found) throw new Error('missing seat');
    return found;
  }

  it('marks and unmarks a pay-out once, logging each change', async () => {
    const { groupId, ann, nightId } = await closedNight();
    const member: Actor = { kind: 'member', playerId: ann };

    expect(await markPaid({ groupId, nightId, playerId: ann, paid: true }, member)).toEqual({
      kind: 'saved',
    });
    expect(await markPaid({ groupId, nightId, playerId: ann, paid: true }, member)).toEqual({
      kind: 'saved',
    });
    expect((await seatOf(groupId, nightId, ann)).paidOutAt).toBeInstanceOf(Date);

    await markPaid({ groupId, nightId, playerId: ann, paid: false }, owner);
    expect((await seatOf(groupId, nightId, ann)).paidOutAt).toBeNull();
    const night = await getNight(groupId, nightId);
    expect(night?.events.slice(0, 3).map((e) => [e.action, e.detail])).toEqual([
      ['seat.unpaid', { playerId: ann, cents: 3500 }],
      ['seat.paid', { playerId: ann, cents: 3500 }],
      ['night.close', expect.anything()],
    ]);
  });

  it.each([
    { name: 'the bank paying itself', payee: (night: { zed: string }) => night.zed },
    { name: 'a busted player who is owed nothing', payee: (night: { bo: string }) => night.bo },
  ])('refuses $name', async ({ payee }) => {
    const night = await closedNight();
    const { groupId, nightId } = night;

    expect(await markPaid({ groupId, nightId, playerId: payee(night), paid: true }, owner)).toEqual(
      { kind: 'nothing-owed' },
    );
  });

  it('waits until the night is closed', async () => {
    const { groupId, ann, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);

    expect(await markPaid({ groupId, nightId, playerId: ann, paid: true }, owner)).toEqual({
      kind: 'night-open',
    });
  });

  it('lists what each bank still owes on closed nights only', async () => {
    const { groupId, ann, ivy, zed, nightId } = await closedNight();
    await markPaid({ groupId, nightId, playerId: ivy, paid: true }, owner);
    const { id: openId } = await createNight(
      { groupId, date: '2026-04-01', location: null, buyInCents: 2000 },
      owner,
    );
    await seat(groupId, openId, ann, 2000, 5000);
    await setBank({ groupId, nightId: openId, playerId: zed }, owner);

    expect(await listOutstandingPayouts(groupId)).toEqual([
      {
        nightId,
        date: '2026-03-07',
        location: 'Ann’s',
        bank: { playerId: zed, name: 'Zed', colorSlot: expect.any(Number) },
        payouts: [{ playerId: ann, name: 'Ann', colorSlot: expect.any(Number), cents: 3500 }],
      },
    ]);
    await markPaid({ groupId, nightId, playerId: ann, paid: true }, owner);
    expect(await listOutstandingPayouts(groupId)).toEqual([]);
  });

  it('clears a pay-out when the cash-out changes after a reopen and keeps the others', async () => {
    const { groupId, ann, ivy, nightId } = await closedNight();
    await markPaid({ groupId, nightId, playerId: ann, paid: true }, owner);
    await markPaid({ groupId, nightId, playerId: ivy, paid: true }, owner);
    await reopenNight(groupId, nightId);

    const annSeat = await seatOf(groupId, nightId, ann);
    const ivySeat = await seatOf(groupId, nightId, ivy);
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ann,
        buyInCents: 2000,
        cashOutCents: 3000,
        expectedUpdatedAt: annSeat.updatedAt,
      },
      owner,
    );
    await upsertSeat(
      {
        groupId,
        nightId,
        playerId: ivy,
        buyInCents: 2500,
        cashOutCents: 1000,
        expectedUpdatedAt: ivySeat.updatedAt,
      },
      owner,
    );

    expect((await seatOf(groupId, nightId, ann)).paidOutAt).toBeNull();
    expect((await seatOf(groupId, nightId, ivy)).paidOutAt).toBeInstanceOf(Date);
  });
});

describe('creating nights', () => {
  it('returns the open night already on that date without a second night or event', async () => {
    const { groupId, nightId } = await setup();

    const again = await createNight(
      { groupId, date: '2026-03-07', location: 'Zed’s', buyInCents: null },
      owner,
    );

    expect(again).toEqual({ kind: 'existing', id: nightId });
    expect(await db.select().from(nights)).toHaveLength(1);
    const events = await db
      .select()
      .from(nightEvents)
      .where(eq(nightEvents.action, 'night.create'));
    expect(events).toHaveLength(1);
  });

  it('creates a new night on the same date once the first is closed', async () => {
    const { groupId, ann, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 2000);
    await closeWithBank(groupId, nightId, ann);

    const again = await createNight(
      { groupId, date: '2026-03-07', location: null, buyInCents: null },
      owner,
    );

    expect(again.kind).toBe('created');
    expect(again.id).not.toBe(nightId);
    expect(await db.select().from(nights)).toHaveLength(2);
  });

  it('creates a night on a different date while another is open', async () => {
    const { groupId, nightId } = await setup();

    const other = await createNight(
      { groupId, date: '2026-03-08', location: null, buyInCents: null },
      owner,
    );

    expect(other.kind).toBe('created');
    expect(other.id).not.toBe(nightId);
  });
});

describe('lists and delete', () => {
  it('lists closed nights only, with seat results', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 1000);
    await closeWithBank(groupId, nightId, ann);
    const open = await createNight(
      { groupId, date: '2026-03-14', location: null, buyInCents: null },
      owner,
    );

    const closed = await listClosedNights(groupId);

    expect(closed.map((n) => n.id)).toEqual([nightId]);
    expect(closed[0].seats).toEqual(
      expect.arrayContaining([
        { playerId: ann, buyInCents: 2000, cashOutCents: 3000 },
        { playerId: ivy, buyInCents: 2000, cashOutCents: 1000 },
      ]),
    );
    expect(closed.map((n) => n.id)).not.toContain(open.id);
  });

  it('filters by season, includes open nights, and lists co-winner names for a tie', async () => {
    const { groupId, ann, ivy, nightId } = await setup();
    await seat(groupId, nightId, ann, 2000, 3000);
    await seat(groupId, nightId, ivy, 2000, 3000);
    const zed = await newPlayer(groupId, 'Zed');
    await seat(groupId, nightId, zed, 2000, 0);
    await closeWithBank(groupId, nightId, ann);
    const old = await createNight(
      { groupId, date: '2025-12-31', location: null, buyInCents: null },
      owner,
    );
    const open = await createNight(
      { groupId, date: '2026-03-14', location: 'Zed’s', buyInCents: null },
      owner,
    );
    await seat(groupId, open.id, ann, 2000, 2000);

    const list = await listNights(groupId, 2026);

    expect(list).toEqual([
      {
        id: open.id,
        date: '2026-03-14',
        location: 'Zed’s',
        buyInCents: null,
        status: 'open',
        winnerNames: [],
      },
      {
        id: nightId,
        date: '2026-03-07',
        location: 'Ann’s',
        buyInCents: 2000,
        status: 'closed',
        winnerNames: ['Ann', 'Ivy'],
      },
    ]);
    expect((await listNights(groupId, 'all')).map((n) => n.id)).toContain(old.id);
  });

  it('deletes a night with its seats and events', async () => {
    const { groupId, ivy, nightId } = await setup();
    await seat(groupId, nightId, ivy, 2000, null);

    expect(await deleteNight(groupId, nightId)).toEqual({ kind: 'deleted' });

    expect(await db.select().from(nights)).toEqual([]);
    expect(await db.select().from(seats)).toEqual([]);
    expect(await db.select().from(nightEvents)).toEqual([]);
    expect(await deleteNight(groupId, nightId)).toEqual({ kind: 'not-found' });
  });
});
