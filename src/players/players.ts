import { db } from '@/db/client';
import { groups } from '@/groups/schema';
import { nightEvents, nights, seats } from '@/nights/schema';
import {
  parsePaymentHandles,
  type PaymentHandleField,
  type PaymentHandles,
} from '@/players/payment-handles';
import { leastUsedSlot } from '@/players/player-color';
import { playerPhotos, players } from '@/players/schema';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export type Player = { id: string; groupId: string; name: string; colorSlot: number };

export type Contact = Player & PaymentHandles;

export type SaveContactResult =
  | { kind: 'saved' }
  | { kind: 'invalid-name' }
  | { kind: 'name-taken' }
  | { kind: 'invalid-handle'; field: PaymentHandleField }
  | { kind: 'not-found' };

export type AddPlayerResult =
  { kind: 'added'; player: Player } | { kind: 'exists'; player: Player } | { kind: 'invalid-name' };

export type MergePlayersResult =
  | { kind: 'merged' }
  | { kind: 'same-night'; dates: string[] }
  | { kind: 'not-found' }
  | { kind: 'same-player' };

const MAX_NAME_LENGTH = 40;

const playerColumns = {
  id: players.id,
  groupId: players.groupId,
  name: players.name,
  colorSlot: players.colorSlot,
};

const contactColumns = {
  ...playerColumns,
  venmoHandle: players.venmoHandle,
  zelleHandle: players.zelleHandle,
};

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export async function addPlayer(input: {
  groupId: string;
  name: string;
}): Promise<AddPlayerResult> {
  const name = normalizeName(input.name);
  if (name.length === 0 || name.length > MAX_NAME_LENGTH) return { kind: 'invalid-name' };

  return db.transaction(async (tx): Promise<AddPlayerResult> => {
    await tx
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.id, input.groupId))
      .for('update');
    const used = await tx
      .select({ colorSlot: players.colorSlot })
      .from(players)
      .where(eq(players.groupId, input.groupId));
    const [added] = await tx
      .insert(players)
      .values({
        groupId: input.groupId,
        name,
        colorSlot: leastUsedSlot(used.map((row) => row.colorSlot)),
      })
      .onConflictDoNothing()
      .returning(playerColumns);
    if (added) return { kind: 'added', player: added };

    const [existing] = await tx
      .select(playerColumns)
      .from(players)
      .where(and(eq(players.groupId, input.groupId), sql`lower(${players.name}) = lower(${name})`))
      .limit(1);
    if (!existing) throw new Error('Player insert conflicted but no matching player was found');
    return { kind: 'exists', player: existing };
  });
}

export async function listPlayers(groupId: string): Promise<Player[]> {
  return db
    .select(playerColumns)
    .from(players)
    .where(eq(players.groupId, groupId))
    .orderBy(asc(players.name));
}

export async function getPlayer(groupId: string, playerId: string): Promise<Player | null> {
  const [player] = await db
    .select(playerColumns)
    .from(players)
    .where(and(eq(players.groupId, groupId), eq(players.id, playerId)))
    .limit(1);
  return player ?? null;
}

export async function listContacts(groupId: string): Promise<Contact[]> {
  return db
    .select(contactColumns)
    .from(players)
    .where(eq(players.groupId, groupId))
    .orderBy(asc(players.name));
}

export async function listPaymentHandles(
  groupId: string,
  playerIds: string[],
): Promise<Record<string, PaymentHandles>> {
  if (playerIds.length === 0) return {};
  const rows = await db
    .select({
      id: players.id,
      venmoHandle: players.venmoHandle,
      zelleHandle: players.zelleHandle,
    })
    .from(players)
    .where(and(eq(players.groupId, groupId), inArray(players.id, playerIds)));
  return Object.fromEntries(
    rows.map((row) => [row.id, { venmoHandle: row.venmoHandle, zelleHandle: row.zelleHandle }]),
  );
}

export async function updateContact(input: {
  groupId: string;
  playerId: string;
  name: string;
  venmo: string;
  zelle: string;
}): Promise<SaveContactResult> {
  const name = normalizeName(input.name);
  if (name.length === 0 || name.length > MAX_NAME_LENGTH) return { kind: 'invalid-name' };
  const parsed = parsePaymentHandles(input);
  if (parsed.kind === 'invalid') return { kind: 'invalid-handle', field: parsed.field };

  return db.transaction(async (tx): Promise<SaveContactResult> => {
    await tx
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.id, input.groupId))
      .for('update');
    const [taken] = await tx
      .select({ id: players.id })
      .from(players)
      .where(
        and(
          eq(players.groupId, input.groupId),
          ne(players.id, input.playerId),
          sql`lower(${players.name}) = lower(${name})`,
        ),
      )
      .limit(1);
    if (taken) return { kind: 'name-taken' };

    const updated = await tx
      .update(players)
      .set({ name, ...parsed.handles })
      .where(and(eq(players.id, input.playerId), eq(players.groupId, input.groupId)))
      .returning({ id: players.id });
    return updated.length > 0 ? { kind: 'saved' } : { kind: 'not-found' };
  });
}

export async function addContact(input: {
  groupId: string;
  name: string;
  venmo: string;
  zelle: string;
}): Promise<SaveContactResult> {
  const parsed = parsePaymentHandles(input);
  if (parsed.kind === 'invalid') return { kind: 'invalid-handle', field: parsed.field };

  const added = await addPlayer({ groupId: input.groupId, name: input.name });
  if (added.kind === 'invalid-name') return { kind: 'invalid-name' };
  if (added.kind === 'exists') return { kind: 'name-taken' };
  await db.update(players).set(parsed.handles).where(eq(players.id, added.player.id));
  return { kind: 'saved' };
}

export async function setHostPlayer(input: {
  groupId: string;
  playerId: string | null;
}): Promise<{ kind: 'saved' } | { kind: 'not-found' }> {
  if (input.playerId !== null && !(await getPlayer(input.groupId, input.playerId))) {
    return { kind: 'not-found' };
  }
  await db
    .update(groups)
    .set({ ownerPlayerId: input.playerId })
    .where(eq(groups.id, input.groupId));
  return { kind: 'saved' };
}

export async function mergePlayers(input: {
  groupId: string;
  fromId: string;
  intoId: string;
}): Promise<MergePlayersResult> {
  const { groupId, fromId, intoId } = input;
  if (fromId === intoId) return { kind: 'same-player' };

  return db.transaction(async (tx): Promise<MergePlayersResult> => {
    const found = await tx
      .select({
        id: players.id,
        venmoHandle: players.venmoHandle,
        zelleHandle: players.zelleHandle,
      })
      .from(players)
      .where(and(eq(players.groupId, groupId), inArray(players.id, [fromId, intoId])))
      .for('update');
    const source = found.find((player) => player.id === fromId);
    const destination = found.find((player) => player.id === intoId);
    if (!source || !destination) return { kind: 'not-found' };

    const target = alias(seats, 'target_seats');
    const shared = await tx
      .selectDistinct({ date: nights.date })
      .from(seats)
      .innerJoin(target, and(eq(target.nightId, seats.nightId), eq(target.playerId, intoId)))
      .innerJoin(nights, eq(nights.id, seats.nightId))
      .where(eq(seats.playerId, fromId))
      .orderBy(asc(nights.date));
    if (shared.length > 0) return { kind: 'same-night', dates: shared.map((row) => row.date) };

    await tx.update(seats).set({ playerId: intoId }).where(eq(seats.playerId, fromId));
    await tx.update(nights).set({ bankPlayerId: intoId }).where(eq(nights.bankPlayerId, fromId));
    await tx
      .update(nightEvents)
      .set({ actorPlayerId: intoId })
      .where(eq(nightEvents.actorPlayerId, fromId));
    await tx.update(groups).set({ ownerPlayerId: intoId }).where(eq(groups.ownerPlayerId, fromId));
    const [destinationPhoto] = await tx
      .select({ playerId: playerPhotos.playerId })
      .from(playerPhotos)
      .where(eq(playerPhotos.playerId, intoId));
    if (!destinationPhoto) {
      await tx
        .update(playerPhotos)
        .set({ playerId: intoId })
        .where(eq(playerPhotos.playerId, fromId));
    }
    await tx.delete(players).where(eq(players.id, fromId));
    await tx
      .update(players)
      .set({
        venmoHandle: destination.venmoHandle ?? source.venmoHandle,
        zelleHandle: destination.zelleHandle ?? source.zelleHandle,
      })
      .where(eq(players.id, intoId));
    return { kind: 'merged' };
  });
}
