'use server';

import { accessCookieOptions, MEMBER_COOKIE } from '@/access/cookies';
import { landingPathFrom, opensGroup } from '@/access/invite';
import { env } from '@/env';
import { getGroup } from '@/groups/groups';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type JoinGroupResult = { kind: 'wrong-password' };

export async function joinGroupAction(formData: FormData): Promise<JoinGroupResult> {
  const entered = z.string().safeParse(formData.get('entry'));
  const landing = z.string().safeParse(formData.get('landing'));
  const group = await getGroup();
  const access = { password: env.GROUP_PASSWORD, inviteCode: group.inviteCode };
  if (!entered.success || !opensGroup(entered.data, access)) {
    return { kind: 'wrong-password' };
  }

  const jar = await cookies();
  jar.set(MEMBER_COOKIE, group.inviteCode, accessCookieOptions());
  redirect(landingPathFrom(landing.success ? landing.data : '/'));
}
