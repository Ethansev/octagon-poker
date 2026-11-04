'use server';

import { actorFor, requireViewer } from '@/access/viewer';
import {
  addComment,
  removeComment,
  setRsvp,
  type AddCommentResult,
  type RemoveCommentResult,
  type SetRsvpResult,
} from '@/nights/invites';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type NoPlayer = { kind: 'no-player' };

function refreshInvite(nightId: string) {
  revalidatePath(`/nights/${nightId}`);
}

export async function setRsvpAction(input: {
  nightId: string;
  response: string;
}): Promise<SetRsvpResult | NoPlayer> {
  const viewer = await requireViewer();
  const parsed = z
    .object({ nightId: z.uuid(), response: z.enum(['going', 'maybe', 'out']) })
    .safeParse(input);
  if (!parsed.success) return { kind: 'not-found' };
  if (viewer.playerId === null) return { kind: 'no-player' };

  const result = await setRsvp({
    groupId: viewer.group.id,
    playerId: viewer.playerId,
    ...parsed.data,
  });
  refreshInvite(parsed.data.nightId);
  return result;
}

export async function addCommentAction(input: {
  nightId: string;
  body: string;
}): Promise<AddCommentResult | NoPlayer> {
  const viewer = await requireViewer();
  const parsed = z.object({ nightId: z.uuid(), body: z.string() }).safeParse(input);
  if (!parsed.success) return { kind: 'not-found' };
  if (viewer.role === 'member' && viewer.playerId === null) return { kind: 'no-player' };

  const result = await addComment({
    groupId: viewer.group.id,
    playerId: viewer.playerId,
    ...parsed.data,
  });
  refreshInvite(parsed.data.nightId);
  return result;
}

export async function removeCommentAction(input: {
  nightId: string;
  commentId: string;
}): Promise<RemoveCommentResult> {
  const viewer = await requireViewer();
  const parsed = z.object({ nightId: z.uuid(), commentId: z.uuid() }).safeParse(input);
  if (!parsed.success) return { kind: 'not-found' };

  const result = await removeComment(
    { groupId: viewer.group.id, ...parsed.data },
    actorFor(viewer),
  );
  refreshInvite(parsed.data.nightId);
  return result;
}
