import { randomBytes, timingSafeEqual } from 'node:crypto';

export function generateInviteCode(): string {
  return randomBytes(18).toString('base64url');
}

const codePattern = /^[A-Za-z0-9_-]+$/;
const joinPathPattern = /\/join\/([A-Za-z0-9_-]+)/;

export function inviteCodeFrom(pasted: string): string | null {
  const text = pasted.trim();
  const fromLink = joinPathPattern.exec(text)?.[1];
  if (fromLink) return fromLink;
  return codePattern.test(text) ? text : null;
}

export function isMemberCode(cookieValue: string | undefined, currentCode: string): boolean {
  if (cookieValue === undefined) return false;
  const given = Buffer.from(cookieValue);
  const expected = Buffer.from(currentCode);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
