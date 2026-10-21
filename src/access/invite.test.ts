import { describe, expect, it } from 'vitest';
import { generateInviteCode, isMemberCode } from '@/access/invite';

describe('generateInviteCode', () => {
  it('makes 24 URL-safe characters', () => {
    expect(generateInviteCode()).toMatch(/^[A-Za-z0-9_-]{24}$/);
  });

  it('differs across calls', () => {
    expect(generateInviteCode()).not.toBe(generateInviteCode());
  });
});

describe('isMemberCode', () => {
  const current = 'current-code-aaaaaaaaaaa';

  it.each([
    { name: 'the current code is a member', cookie: current, expected: true },
    {
      name: 'the code from before a reset is not a member',
      cookie: 'previous-code-bbbbbbbbbb',
      expected: false,
    },
    { name: 'a missing cookie is not a member', cookie: undefined, expected: false },
    { name: 'a code of a different length is not a member', cookie: 'short', expected: false },
  ])('$name', ({ cookie, expected }) => {
    expect(isMemberCode(cookie, current)).toBe(expected);
  });
});
