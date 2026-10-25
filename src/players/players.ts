import { db } from '@/db/client';
import { groups } from '@/groups/schema';
import { nightEvents, nights, seats } from '@/nights/schema';
import { leastUsedSlot } from '@/players/player-color';
import { players } from '@/players/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export type Player = { id: string; groupId: string; name: string; colorSlot: number };

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

export async function mergePlayers(input: {
  groupId: string;
  fromId: string;
  intoId: string;
}): Promise<MergePlayersResult> {
  const { groupId, fromId, intoId } = input;
  if (fromId === intoId) return { kind: 'same-player' };

  return db.transaction(async (tx): Promise<MergePlayersResult> => {
    const found = await tx
      .select({ id: players.id })
      .from(players)
      .where(and(eq(players.groupId, groupId), inArray(players.id, [fromId, intoId])))
      .for('update');
    if (found.length !== 2) return { kind: 'not-found' };

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
    await tx
      .update(nightEvents)
      .set({ actorPlayerId: intoId })
      .where(eq(nightEvents.actorPlayerId, fromId));
    await tx.delete(players).where(eq(players.id, fromId));
    return { kind: 'merged' };
  });
}
