import { NextResponse, type NextRequest } from 'next/server';
import { accessCookieOptions, MEMBER_COOKIE } from '@/access/cookies';
import { isMemberCode } from '@/access/invite';
import { getGroup } from '@/groups/groups';

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const group = await getGroup();

  if (!isMemberCode(code, group.inviteCode)) {
    return NextResponse.redirect(new URL('/join/invalid', request.url));
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(MEMBER_COOKIE, group.inviteCode, accessCookieOptions());
  return response;
}
