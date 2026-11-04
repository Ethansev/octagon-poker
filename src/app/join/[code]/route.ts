import { accessCookieOptions, MEMBER_COOKIE } from '@/access/cookies';
import { isMemberCode } from '@/access/invite';
import { env } from '@/env';
import { getGroup } from '@/groups/groups';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const group = await getGroup();

  if (!isMemberCode(code, group.inviteCode)) {
    return NextResponse.redirect(new URL('/join/invalid', env.BETTER_AUTH_URL));
  }

  const night = z.uuid().safeParse(request.nextUrl.searchParams.get('night'));
  const landing = night.success ? `/nights/${night.data}` : '/';
  const response = NextResponse.redirect(new URL(landing, env.BETTER_AUTH_URL));
  response.cookies.set(MEMBER_COOKIE, group.inviteCode, accessCookieOptions());
  return response;
}
