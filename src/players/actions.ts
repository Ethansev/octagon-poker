'use server';

import { accessCookieOptions, PLAYER_COOKIE } from '@/access/cookies';
import { requireOwner, requireViewer } from '@/access/viewer';
import type { AddPlayerResult, MergePlayersResult, SaveContactResult } from '@/players/players';
import {
  addContact,
  addPlayer,
  getPlayer,
  mergePlayers,
  setHostPlayer,
  updateContact,
} from '@/players/players';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

export type InvalidInput = { kind: 'invalid-input' };

const addSchema = z.object({ name: z.string() });
const idSchema = z.uuid();
const contactSchema = z.object({ name: z.string(), venmo: z.string(), zelle: z.string() });
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

function contactFields(formData: FormData) {
  return contactSchema.safeParse({
    name: formData.get('name'),
    venmo: formData.get('venmo'),
    zelle: formData.get('zelle'),
  });
}

export async function addContactAction(
  formData: FormData,
): Promise<SaveContactResult | InvalidInput> {
  const viewer = await requireOwner();
  const fields = contactFields(formData);
  if (!fields.success) return { kind: 'invalid-input' };

  const result = await addContact({ groupId: viewer.group.id, ...fields.data });
  revalidatePath('/', 'layout');
  return result;
}

export async function updateContactAction(
  playerId: string,
  formData: FormData,
): Promise<SaveContactResult | InvalidInput> {
  const viewer = await requireOwner();
  const id = idSchema.safeParse(playerId);
  const fields = contactFields(formData);
  if (!id.success || !fields.success) return { kind: 'invalid-input' };

  const result = await updateContact({
    groupId: viewer.group.id,
    playerId: id.data,
    ...fields.data,
  });
  revalidatePath('/', 'layout');
  return result;
}

export async function setHostPlayerAction(
  playerId: string | null,
): Promise<{ kind: 'saved' } | { kind: 'not-found' } | InvalidInput> {
  const viewer = await requireOwner();
  const parsed = idSchema.nullable().safeParse(playerId);
  if (!parsed.success) return { kind: 'invalid-input' };

  const result = await setHostPlayer({ groupId: viewer.group.id, playerId: parsed.data });
  revalidatePath('/', 'layout');
  return result;
}
