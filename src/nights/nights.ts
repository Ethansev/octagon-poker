import type { Actor } from '@/access/viewer';
import { db } from '@/db/client';
import { nightEvents, nights, seats } from '@/nights/schema';
import { players } from '@/players/schema';
import type { ClosedNight, NightBalance, SeatResult } from '@/stats/nights';
import { nightBalance, nightWinners } from '@/stats/nights';
import type { Season } from '@/stats/season';
import { nightsInSeason } from '@/stats/season';
import { and, asc, desc, eq, gt, inArray, isNotNull, isNull, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export type SeatView = {
  playerId: string;
  playerName: string;
  playerColorSlot: number;
  buyInCents: number;
  cashOutCents: number | null;
  paidOutAt: Date | null;
  updatedAt: Date;
};

export type NightEventView = {
  id: string;
  actorKind: 'owner' | 'member';
  actorName: string | null;
  action: string;
  detail: unknown;
  createdAt: Date;
};

export type NightDetail = {
  id: string;
  date: string;
  location: string | null;
  buyInCents: number | null;
  status: 'open' | 'closed';
  bankPlayerId: string | null;
  seats: SeatView[];
  events: NightEventView[];
  winners: string[];
};

export type NightSummary = {
  id: string;
  date: string;
  location: string | null;
  buyInCents: number | null;
  status: 'open' | 'closed';
  winnerNames: string[];
};

export type UpdateNightResult =
  { kind: 'saved' } | { kind: 'night-closed' } | { kind: 'not-found' };

export type UpsertSeatResult =
  | { kind: 'saved'; updatedAt: Date }
  | { kind: 'conflict'; current: SeatView }
  | { kind: 'night-closed' }
  | { kind: 'not-found' };

export type RemoveSeatResult =
  { kind: 'removed' } | { kind: 'night-closed' } | { kind: 'not-found' };

export type CloseNightResult =
  | { kind: 'closed'; winners: string[] }
  | { kind: 'not-balanced'; balance: Exclude<NightBalance, { kind: 'balanced' }> }
  | { kind: 'no-bank' }
  | { kind: 'not-found' };

type PayoutPerson = { playerId: string; name: string; colorSlot: number };

export type OutstandingNight = {
  nightId: string;
  date: string;
  location: string | null;
  bank: PayoutPerson;
  payouts: (PayoutPerson & { cents: number })[];
};

export type MarkPaidResult =
  { kind: 'saved' } | { kind: 'nothing-owed' } | { kind: 'night-open' } | { kind: 'not-found' };

export type SetBankResult =
  { kind: 'set' } | { kind: 'not-seated' } | { kind: 'night-closed' } | { kind: 'not-found' };

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Cents = { buyInCents: number; cashOutCents: number | null };

const seatViewColumns = {
  playerId: seats.playerId,
  playerName: players.name,
  playerColorSlot: players.colorSlot,
  buyInCents: seats.buyInCents,
  cashOutCents: seats.cashOutCents,
  paidOutAt: seats.paidOutAt,
  updatedAt: seats.updatedAt,
};

const msNow = sql`date_trunc('milliseconds', clock_timestamp())`;

const nextToken = sql`greatest(${msNow}, date_trunc('milliseconds', ${seats.updatedAt}) + interval '1 millisecond')`;

function actorColumns(actor: Actor): {
  actorKind: 'owner' | 'member';
  actorPlayerId: string | null;
} {
  return {
    actorKind: actor.kind,
    actorPlayerId: actor.kind === 'member' ? actor.playerId : null,
  };
}

async function lockNight(tx: Tx, groupId: string, nightId: string) {
  const [night] = await tx
    .select()
    .from(nights)
    .where(and(eq(nights.id, nightId), eq(nights.groupId, groupId)))
    .for('update');
  return night ?? null;
}

async function findSeatView(tx: Tx, nightId: string, playerId: string): Promise<SeatView | null> {
  const [seat] = await tx
    .select(seatViewColumns)
    .from(seats)
    .innerJoin(players, eq(players.id, seats.playerId))
    .where(and(eq(seats.nightId, nightId), eq(seats.playerId, playerId)));
  return seat ?? null;
}

function centsOf(seat: Cents): Cents {
  return { buyInCents: seat.buyInCents, cashOutCents: seat.cashOutCents };
}

function closedSeats(
  rows: { playerId: string; buyInCents: number; cashOutCents: number | null }[],
): SeatResult[] {
  return rows.flatMap((row) =>
    row.cashOutCents === null
      ? []
      : [{ playerId: row.playerId, buyInCents: row.buyInCents, cashOutCents: row.cashOutCents }],
  );
}

export type CreateNightResult = { kind: 'created'; id: string } | { kind: 'existing'; id: string };

export async function createNight(
  input: { groupId: string; date: string; location: string | null; buyInCents: number | null },
  actor: Actor,
): Promise<CreateNightResult> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${input.groupId + input.date}))`);
    const [open] = await tx
      .select({ id: nights.id })
      .from(nights)
      .where(
        and(
          eq(nights.groupId, input.groupId),
          eq(nights.date, input.date),
          eq(nights.status, 'open'),
        ),
      )
      .limit(1);
    if (open) return { kind: 'existing', id: open.id };
    const [night] = await tx
      .insert(nights)
      .values({
        groupId: input.groupId,
        date: input.date,
        location: input.location,
        buyInCents: input.buyInCents,
      })
      .returning({ id: nights.id });
    await tx.insert(nightEvents).values({
      nightId: night.id,
      ...actorColumns(actor),
      action: 'night.create',
      detail: { date: input.date, location: input.location, buyInCents: input.buyInCents },
    });
    return { kind: 'created', id: night.id };
  });
}

export async function updateNight(
  input: {
    groupId: string;
    nightId: string;
    date: string;
    location: string | null;
    buyInCents: number | null;
  },
  actor: Actor,
): Promise<UpdateNightResult> {
  return db.transaction(async (tx) => {
    const night = await lockNight(tx, input.groupId, input.nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'closed') return { kind: 'night-closed' };
    const after = { date: input.date, location: input.location, buyInCents: input.buyInCents };
    await tx.update(nights).set(after).where(eq(nights.id, night.id));
    await tx.insert(nightEvents).values({
      nightId: night.id,
      ...actorColumns(actor),
      action: 'night.update',
      detail: {
        before: { date: night.date, location: night.location, buyInCents: night.buyInCents },
        after,
      },
    });
    return { kind: 'saved' };
  });
}

export async function getNight(groupId: string, nightId: string): Promise<NightDetail | null> {
  const [night] = await db
    .select()
    .from(nights)
    .where(and(eq(nights.id, nightId), eq(nights.groupId, groupId)));
  if (!night) return null;

  const seatRows = await db
    .select(seatViewColumns)
    .from(seats)
    .innerJoin(players, eq(players.id, seats.playerId))
    .where(eq(seats.nightId, nightId))
    .orderBy(asc(players.name));

  const eventRows = await db
    .select({
      id: nightEvents.id,
      actorKind: nightEvents.actorKind,
      actorName: players.name,
      action: nightEvents.action,
      detail: nightEvents.detail,
      createdAt: nightEvents.createdAt,
    })
    .from(nightEvents)
    .leftJoin(players, eq(players.id, nightEvents.actorPlayerId))
    .where(eq(nightEvents.nightId, nightId))
    .orderBy(desc(nightEvents.createdAt), desc(nightEvents.id));

  return {
    id: night.id,
    date: night.date,
    location: night.location,
    buyInCents: night.buyInCents,
    status: night.status,
    bankPlayerId: night.bankPlayerId,
    seats: seatRows,
    events: eventRows,
    winners: night.status === 'closed' ? nightWinners(closedSeats(seatRows)) : [],
  };
}

export async function upsertSeat(
  input: {
    groupId: string;
    nightId: string;
    playerId: string;
    buyInCents: number;
    cashOutCents: number | null;
    expectedUpdatedAt: Date | null;
  },
  actor: Actor,
): Promise<UpsertSeatResult> {
  return db.transaction(async (tx): Promise<UpsertSeatResult> => {
    const night = await lockNight(tx, input.groupId, input.nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'closed') return { kind: 'night-closed' };

    const [player] = await tx
      .select({ id: players.id })
      .from(players)
      .where(and(eq(players.id, input.playerId), eq(players.groupId, input.groupId)));
    if (!player) return { kind: 'not-found' };

    const after: Cents = { buyInCents: input.buyInCents, cashOutCents: input.cashOutCents };
    let before: Cents | null = null;
    let updatedAt: Date;

    if (input.expectedUpdatedAt === null) {
      const [inserted] = await tx
        .insert(seats)
        .values({ nightId: input.nightId, playerId: input.playerId, ...after, updatedAt: msNow })
        .onConflictDoNothing()
        .returning({ updatedAt: seats.updatedAt });
      if (!inserted) {
        const current = await findSeatView(tx, input.nightId, input.playerId);
        return current ? { kind: 'conflict', current } : { kind: 'not-found' };
      }
      updatedAt = inserted.updatedAt;
    } else {
      const existing = await findSeatView(tx, input.nightId, input.playerId);
      if (!existing) return { kind: 'not-found' };
      before = centsOf(existing);
      const [updated] = await tx
        .update(seats)
        .set({
          ...after,
          paidOutAt: existing.cashOutCents === after.cashOutCents ? existing.paidOutAt : null,
          updatedAt: nextToken,
        })
        .where(
          and(
            eq(seats.nightId, input.nightId),
            eq(seats.playerId, input.playerId),
            sql`date_trunc('milliseconds', ${seats.updatedAt}) = ${input.expectedUpdatedAt}`,
          ),
        )
        .returning({ updatedAt: seats.updatedAt });
      if (!updated) return { kind: 'conflict', current: existing };
      updatedAt = updated.updatedAt;
    }

    await tx.insert(nightEvents).values({
      nightId: input.nightId,
      ...actorColumns(actor),
      action: before === null ? 'seat.add' : 'seat.update',
      detail: { playerId: input.playerId, before, after },
    });
    return { kind: 'saved', updatedAt };
  });
}

export async function removeSeat(
  input: { groupId: string; nightId: string; playerId: string },
  actor: Actor,
): Promise<RemoveSeatResult> {
  return db.transaction(async (tx): Promise<RemoveSeatResult> => {
    const night = await lockNight(tx, input.groupId, input.nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'closed') return { kind: 'night-closed' };
    const [removed] = await tx
      .delete(seats)
      .where(and(eq(seats.nightId, input.nightId), eq(seats.playerId, input.playerId)))
      .returning({ buyInCents: seats.buyInCents, cashOutCents: seats.cashOutCents });
    if (!removed) return { kind: 'not-found' };
    if (night.bankPlayerId === input.playerId) {
      await tx.update(nights).set({ bankPlayerId: null }).where(eq(nights.id, night.id));
    }
    await tx.insert(nightEvents).values({
      nightId: input.nightId,
      ...actorColumns(actor),
      action: 'seat.remove',
      detail: { playerId: input.playerId, before: centsOf(removed), after: null },
    });
    return { kind: 'removed' };
  });
}

export async function setBank(
  input: { groupId: string; nightId: string; playerId: string },
  actor: Actor,
): Promise<SetBankResult> {
  return db.transaction(async (tx): Promise<SetBankResult> => {
    const night = await lockNight(tx, input.groupId, input.nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'closed') return { kind: 'night-closed' };
    const [seated] = await tx
      .select({ playerId: seats.playerId })
      .from(seats)
      .where(and(eq(seats.nightId, night.id), eq(seats.playerId, input.playerId)));
    if (!seated) return { kind: 'not-seated' };
    if (night.bankPlayerId === input.playerId) return { kind: 'set' };
    await tx.update(nights).set({ bankPlayerId: input.playerId }).where(eq(nights.id, night.id));
    await tx.insert(nightEvents).values({
      nightId: night.id,
      ...actorColumns(actor),
      action: 'night.bank',
      detail: { before: night.bankPlayerId, after: input.playerId },
    });
    return { kind: 'set' };
  });
}

export async function markPaid(
  input: { groupId: string; nightId: string; playerId: string; paid: boolean },
  actor: Actor,
): Promise<MarkPaidResult> {
  return db.transaction(async (tx): Promise<MarkPaidResult> => {
    const night = await lockNight(tx, input.groupId, input.nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'open') return { kind: 'night-open' };
    const [seat] = await tx
      .select({ cashOutCents: seats.cashOutCents, paidOutAt: seats.paidOutAt })
      .from(seats)
      .where(and(eq(seats.nightId, night.id), eq(seats.playerId, input.playerId)));
    if (!seat) return { kind: 'not-found' };
    const cents = seat.cashOutCents ?? 0;
    if (cents === 0 || night.bankPlayerId === null || night.bankPlayerId === input.playerId) {
      return { kind: 'nothing-owed' };
    }
    if ((seat.paidOutAt !== null) === input.paid) return { kind: 'saved' };
    await tx
      .update(seats)
      .set({ paidOutAt: input.paid ? msNow : null })
      .where(and(eq(seats.nightId, night.id), eq(seats.playerId, input.playerId)));
    await tx.insert(nightEvents).values({
      nightId: night.id,
      ...actorColumns(actor),
      action: input.paid ? 'seat.paid' : 'seat.unpaid',
      detail: { playerId: input.playerId, cents },
    });
    return { kind: 'saved' };
  });
}

export async function closeNight(groupId: string, nightId: string): Promise<CloseNightResult> {
  return db.transaction(async (tx): Promise<CloseNightResult> => {
    const night = await lockNight(tx, groupId, nightId);
    if (!night) return { kind: 'not-found' };
    const rows = await tx
      .select({
        playerId: seats.playerId,
        buyInCents: seats.buyInCents,
        cashOutCents: seats.cashOutCents,
      })
      .from(seats)
      .where(eq(seats.nightId, nightId));
    const balance = nightBalance(rows);
    if (balance.kind !== 'balanced') return { kind: 'not-balanced', balance };
    const winners = nightWinners(closedSeats(rows));
    if (night.status === 'closed') return { kind: 'closed', winners };
    if (night.bankPlayerId === null) return { kind: 'no-bank' };
    await tx
      .update(nights)
      .set({ status: 'closed', closedAt: sql`now()` })
      .where(eq(nights.id, nightId));
    await tx.insert(nightEvents).values({
      nightId,
      actorKind: 'owner',
      actorPlayerId: null,
      action: 'night.close',
      detail: { winners },
    });
    return { kind: 'closed', winners };
  });
}

export async function reopenNight(
  groupId: string,
  nightId: string,
): Promise<{ kind: 'reopened' } | { kind: 'not-found' }> {
  return db.transaction(async (tx) => {
    const night = await lockNight(tx, groupId, nightId);
    if (!night) return { kind: 'not-found' };
    if (night.status === 'open') return { kind: 'reopened' };
    await tx.update(nights).set({ status: 'open', closedAt: null }).where(eq(nights.id, nightId));
    await tx.insert(nightEvents).values({
      nightId,
      actorKind: 'owner',
      actorPlayerId: null,
      action: 'night.reopen',
      detail: {},
    });
    return { kind: 'reopened' };
  });
}

export async function deleteNight(
  groupId: string,
  nightId: string,
): Promise<{ kind: 'deleted' } | { kind: 'not-found' }> {
  const deleted = await db
    .delete(nights)
    .where(and(eq(nights.id, nightId), eq(nights.groupId, groupId)))
    .returning({ id: nights.id });
  return deleted.length > 0 ? { kind: 'deleted' } : { kind: 'not-found' };
}

export async function listClosedNights(groupId: string): Promise<ClosedNight[]> {
  const nightRows = await db
    .select({ id: nights.id, date: nights.date })
    .from(nights)
    .where(and(eq(nights.groupId, groupId), eq(nights.status, 'closed')))
    .orderBy(desc(nights.date), desc(nights.createdAt));
  if (nightRows.length === 0) return [];
  const seatRows = await db
    .select({
      nightId: seats.nightId,
      playerId: seats.playerId,
      buyInCents: seats.buyInCents,
      cashOutCents: seats.cashOutCents,
    })
    .from(seats)
    .where(
      inArray(
        seats.nightId,
        nightRows.map((n) => n.id),
      ),
    );
  return nightRows.map((night) => ({
    id: night.id,
    date: night.date,
    seats: closedSeats(seatRows.filter((seat) => seat.nightId === night.id)),
  }));
}

export async function listNights(groupId: string, season: Season): Promise<NightSummary[]> {
  const nightRows = await db
    .select({
      id: nights.id,
      date: nights.date,
      location: nights.location,
      buyInCents: nights.buyInCents,
      status: nights.status,
    })
    .from(nights)
    .where(eq(nights.groupId, groupId))
    .orderBy(desc(nights.date), desc(nights.createdAt));

  const inSeason = nightsInSeason(
    nightRows.map((night) => ({ id: night.id, date: night.date, seats: [] })),
    season,
  );
  const ids = new Set(inSeason.map((night) => night.id));
  const visible = nightRows.filter((night) => ids.has(night.id));

  const closedIds = visible.filter((n) => n.status === 'closed').map((n) => n.id);
  const seatRows =
    closedIds.length === 0
      ? []
      : await db
          .select({
            nightId: seats.nightId,
            playerId: seats.playerId,
            playerName: players.name,
            buyInCents: seats.buyInCents,
            cashOutCents: seats.cashOutCents,
          })
          .from(seats)
          .innerJoin(players, eq(players.id, seats.playerId))
          .where(inArray(seats.nightId, closedIds));

  return visible.map((night) => {
    const nightSeats = seatRows.filter((seat) => seat.nightId === night.id);
    const winnerIds = new Set(nightWinners(closedSeats(nightSeats)));
    const winnerNames = nightSeats
      .filter((seat) => winnerIds.has(seat.playerId))
      .map((seat) => seat.playerName)
      .sort((a, b) => a.localeCompare(b));
    return { ...night, winnerNames: night.status === 'closed' ? winnerNames : [] };
  });
}

export async function listOutstandingPayouts(groupId: string): Promise<OutstandingNight[]> {
  const bank = alias(players, 'bank');
  const rows = await db
    .select({
      nightId: nights.id,
      date: nights.date,
      location: nights.location,
      bankId: bank.id,
      bankName: bank.name,
      bankColorSlot: bank.colorSlot,
      playerId: seats.playerId,
      name: players.name,
      colorSlot: players.colorSlot,
      cents: seats.cashOutCents,
    })
    .from(nights)
    .innerJoin(bank, eq(bank.id, nights.bankPlayerId))
    .innerJoin(seats, eq(seats.nightId, nights.id))
    .innerJoin(players, eq(players.id, seats.playerId))
    .where(
      and(
        eq(nights.groupId, groupId),
        eq(nights.status, 'closed'),
        isNotNull(nights.bankPlayerId),
        ne(seats.playerId, bank.id),
        gt(seats.cashOutCents, 0),
        isNull(seats.paidOutAt),
      ),
    )
    .orderBy(
      desc(nights.date),
      desc(nights.createdAt),
      desc(seats.cashOutCents),
      asc(players.name),
    );

  const byNight = new Map<string, OutstandingNight>();
  for (const row of rows) {
    const night = byNight.get(row.nightId) ?? {
      nightId: row.nightId,
      date: row.date,
      location: row.location,
      bank: { playerId: row.bankId, name: row.bankName, colorSlot: row.bankColorSlot },
      payouts: [],
    };
    night.payouts.push({
      playerId: row.playerId,
      name: row.name,
      colorSlot: row.colorSlot,
      cents: row.cents ?? 0,
    });
    byNight.set(row.nightId, night);
  }
  return [...byNight.values()];
}
