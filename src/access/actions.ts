'use server';

import { accessCookieOptions, MEMBER_COOKIE } from '@/access/cookies';
import { inviteCodeFrom, isMemberCode } from '@/access/invite';
import { getGroup } from '@/groups/groups';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type JoinWithLinkResult = { kind: 'wrong-link' };

export async function joinWithLinkAction(formData: FormData): Promise<JoinWithLinkResult> {
  const parsed = z.string().safeParse(formData.get('link'));
  const code = parsed.success ? inviteCodeFrom(parsed.data) : null;
  const group = await getGroup();
  if (code === null || !isMemberCode(code, group.inviteCode)) return { kind: 'wrong-link' };

  const jar = await cookies();
  jar.set(MEMBER_COOKIE, group.inviteCode, accessCookieOptions());
  redirect('/');
}
