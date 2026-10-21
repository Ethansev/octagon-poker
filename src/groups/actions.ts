'use server';

import { requireOwner } from '@/access/viewer';
import { env } from '@/env';
import { renameGroup, resetInviteCode } from '@/groups/groups';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const nameSchema = z.string().trim().min(1).max(60);

export async function resetInviteAction(): Promise<{ joinUrl: string }> {
  const viewer = await requireOwner();
  const code = await resetInviteCode(viewer.group.id);
  revalidatePath('/', 'layout');
  return { joinUrl: `${env.BETTER_AUTH_URL}/join/${code}` };
}

export async function renameGroupAction(
  formData: FormData,
): Promise<{ kind: 'saved' } | { kind: 'invalid-input' }> {
  const viewer = await requireOwner();
  const parsed = nameSchema.safeParse(formData.get('name'));
  if (!parsed.success) return { kind: 'invalid-input' };

  await renameGroup(viewer.group.id, parsed.data);
  revalidatePath('/', 'layout');
  return { kind: 'saved' };
}
