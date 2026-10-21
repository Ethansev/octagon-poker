import { NextResponse, type NextRequest } from 'next/server';
import { accessCookieOptions, MEMBER_COOKIE } from '@/access/cookies';
import { isMemberCode } from '@/access/invite';
import { env } from '@/env';
import { getGroup } from '@/groups/groups';

export async function GET(_request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const group = await getGroup();

  if (!isMemberCode(code, group.inviteCode)) {
    return NextResponse.redirect(new URL('/join/invalid', env.BETTER_AUTH_URL));
  }

  const response = NextResponse.redirect(new URL('/', env.BETTER_AUTH_URL));
  response.cookies.set(MEMBER_COOKIE, group.inviteCode, accessCookieOptions());
  return response;
}
