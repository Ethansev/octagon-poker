import { randomBytes, timingSafeEqual } from 'node:crypto';

export function generateInviteCode(): string {
  return randomBytes(18).toString('base64url');
}

export function isMemberCode(cookieValue: string | undefined, currentCode: string): boolean {
  if (cookieValue === undefined) return false;
  const given = Buffer.from(cookieValue);
  const expected = Buffer.from(currentCode);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
