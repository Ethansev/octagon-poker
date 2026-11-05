import type { Actor } from '@/access/viewer';
import { db } from '@/db/client';
import { nightComments, nightRsvps, nights, seats } from '@/nights/schema';
import { players } from '@/players/schema';
import { and, asc, eq, ne, sql } from 'drizzle-orm';

export type NightResponse = 'going' | 'maybe' | 'out';

export type NightRsvp = {
  playerId: string;
  name: string;
  colorSlot: number;
  response: NightResponse;
};

export type NightComment = {
  id: string;
  playerId: string | null;
  name: string | null;
  colorSlot: number | null;
  body: string;
  createdAt: Date;
};

export type SetRsvpResult = { kind: 'saved' } | { kind: 'not-found' } | { kind: 'night-closed' };

export type AddCommentResult = { kind: 'saved' } | { kind: 'not-found' } | { kind: 'invalid-body' };

export type RemoveCommentResult =
  { kind: 'removed' } | { kind: 'not-found' } | { kind: 'not-allowed' };

const MAX_COMMENT_LENGTH = 500;

async function findNight(groupId: string, nightId: string) {
  const [night] = await db
    .select({ id: nights.id, status: nights.status })
    .from(nights)
    .where(and(eq(nights.id, nightId), eq(nights.groupId, groupId)));
  return night ?? null;
}

async function playerInGroup(groupId: string, playerId: string): Promise<boolean> {
  const [player] = await db
    .select({ id: players.id })
    .from(players)
    .where(and(eq(players.id, playerId), eq(players.groupId, groupId)));
  return Boolean(player);
}

export async function setRsvp(input: {
  groupId: string;
  nightId: string;
  playerId: string;
  response: NightResponse;
}): Promise<SetRsvpResult> {
  const night = await findNight(input.groupId, input.nightId);
  if (!night || !(await playerInGroup(input.groupId, input.playerId))) return { kind: 'not-found' };
  if (night.status === 'closed') return { kind: 'night-closed' };

  await db
    .insert(nightRsvps)
    .values({ nightId: night.id, playerId: input.playerId, response: input.response })
    .onConflictDoUpdate({
      target: [nightRsvps.nightId, nightRsvps.playerId],
      set: { response: input.response, updatedAt: sql`now()` },
      where: ne(nightRsvps.response, input.response),
    });
  return { kind: 'saved' };
}

export async function listAttendance(nightId: string): Promise<NightRsvp[]> {
  const [replies, seated] = await Promise.all([
    db
      .select({
        playerId: nightRsvps.playerId,
        name: players.name,
        colorSlot: players.colorSlot,
        response: nightRsvps.response,
      })
      .from(nightRsvps)
      .innerJoin(players, eq(players.id, nightRsvps.playerId))
      .where(eq(nightRsvps.nightId, nightId))
      .orderBy(asc(nightRsvps.updatedAt), asc(players.name)),
    db
      .select({ playerId: seats.playerId, name: players.name, colorSlot: players.colorSlot })
      .from(seats)
      .innerJoin(players, eq(players.id, seats.playerId))
      .where(eq(seats.nightId, nightId))
      .orderBy(asc(players.name)),
  ]);
  const replied = new Set(replies.map((reply) => reply.playerId));
  return [
    ...replies,
    ...seated
      .filter((seat) => !replied.has(seat.playerId))
      .map((seat): NightRsvp => ({ ...seat, response: 'going' })),
  ];
}

export async function addComment(input: {
  groupId: string;
  nightId: string;
  playerId: string | null;
  body: string;
}): Promise<AddCommentResult> {
  const body = input.body.trim();
  if (body.length === 0 || body.length > MAX_COMMENT_LENGTH) return { kind: 'invalid-body' };
  if (!(await findNight(input.groupId, input.nightId))) return { kind: 'not-found' };
  if (input.playerId !== null && !(await playerInGroup(input.groupId, input.playerId))) {
    return { kind: 'not-found' };
  }

  await db.insert(nightComments).values({ nightId: input.nightId, playerId: input.playerId, body });
  return { kind: 'saved' };
}

export async function listComments(nightId: string): Promise<NightComment[]> {
  return db
    .select({
      id: nightComments.id,
      playerId: nightComments.playerId,
      name: players.name,
      colorSlot: players.colorSlot,
      body: nightComments.body,
      createdAt: nightComments.createdAt,
    })
    .from(nightComments)
    .leftJoin(players, eq(players.id, nightComments.playerId))
    .where(eq(nightComments.nightId, nightId))
    .orderBy(asc(nightComments.createdAt), asc(nightComments.id));
}

export async function removeComment(
  input: { groupId: string; nightId: string; commentId: string },
  actor: Actor,
): Promise<RemoveCommentResult> {
  if (!(await findNight(input.groupId, input.nightId))) return { kind: 'not-found' };
  const [comment] = await db
    .select({ playerId: nightComments.playerId })
    .from(nightComments)
    .where(and(eq(nightComments.id, input.commentId), eq(nightComments.nightId, input.nightId)));
  if (!comment) return { kind: 'not-found' };

  const isAuthor =
    actor.kind === 'member' && actor.playerId !== null && actor.playerId === comment.playerId;
  if (actor.kind !== 'owner' && !isAuthor) return { kind: 'not-allowed' };

  await db.delete(nightComments).where(eq(nightComments.id, input.commentId));
  return { kind: 'removed' };
}

export function seesNightDetails(
  viewer: { role: 'owner' | 'member'; playerId: string | null },
  rsvps: Pick<NightRsvp, 'playerId' | 'response'>[],
): boolean {
  if (viewer.role === 'owner') return true;
  return rsvps.some((rsvp) => rsvp.playerId === viewer.playerId && rsvp.response === 'going');
}

export function nightDetailsLabel(night: {
  address: string | null;
  notes: string | null;
}): string | null {
  if (night.address !== null && night.notes !== null) return 'Location & notes';
  if (night.address !== null) return 'Location';
  return night.notes === null ? null : 'Notes for guests';
}
