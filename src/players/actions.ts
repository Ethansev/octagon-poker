'use server';

import { accessCookieOptions, PLAYER_COOKIE } from '@/access/cookies';
import { requireOwner, requireViewer } from '@/access/viewer';
import type { AddPlayerResult, MergePlayersResult } from '@/players/players';
import { addPlayer, getPlayer, mergePlayers } from '@/players/players';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

export type InvalidInput = { kind: 'invalid-input' };

const addSchema = z.object({ name: z.string() });
const idSchema = z.uuid();
const mergeSchema = z.object({ fromId: z.uuid(), intoId: z.uuid() });

export async function addPlayerAction(formData: FormData): Promise<AddPlayerResult | InvalidInput> {
  const viewer = await requireViewer();
  const parsed = addSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return { kind: 'invalid-input' };

  const result = await addPlayer({ groupId: viewer.group.id, name: parsed.data.name });
  revalidatePath('/', 'layout');
  return result;
}

export async function chooseMeAction(
  playerId: string,
): Promise<{ kind: 'chosen' } | { kind: 'not-found' } | InvalidInput> {
  const viewer = await requireViewer();
  const parsed = idSchema.safeParse(playerId);
  if (!parsed.success) return { kind: 'invalid-input' };

  const player = await getPlayer(viewer.group.id, parsed.data);
  if (!player) return { kind: 'not-found' };

  const jar = await cookies();
  jar.set(PLAYER_COOKIE, player.id, accessCookieOptions());
  revalidatePath('/', 'layout');
  return { kind: 'chosen' };
}

export async function mergePlayersAction(
  formData: FormData,
): Promise<MergePlayersResult | InvalidInput> {
  const viewer = await requireOwner();
  const parsed = mergeSchema.safeParse({
    fromId: formData.get('fromId'),
    intoId: formData.get('intoId'),
  });
  if (!parsed.success) return { kind: 'invalid-input' };

  const result = await mergePlayers({ groupId: viewer.group.id, ...parsed.data });
  revalidatePath('/', 'layout');
  return result;
}
