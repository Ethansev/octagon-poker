import { generateInviteCode, inviteCodeFrom, isMemberCode } from '@/access/invite';
import { describe, expect, it } from 'vitest';

describe('inviteCodeFrom', () => {
  const code = 'Ab3_x-9QzLmN0pRsTuVwXyZ1';

  it.each([
    { name: 'a full group link', pasted: `https://poker.example.com/join/${code}`, expected: code },
    {
      name: 'a link with a trailing slash and query',
      pasted: `https://poker.example.com/join/${code}/?utm=chat`,
      expected: code,
    },
    {
      name: 'a link inside the rest of a chat message',
      pasted: `Here you go: https://poker.example.com/join/${code} see you Friday`,
      expected: code,
    },
    { name: 'the bare code with stray spaces', pasted: `  ${code}\n`, expected: code },
    {
      name: 'a link to some other page',
      pasted: 'https://poker.example.com/nights',
      expected: null,
    },
    { name: 'a sentence with no link', pasted: 'what is the link?', expected: null },
    { name: 'nothing at all', pasted: '   ', expected: null },
  ])('$name', ({ pasted, expected }) => {
    expect(inviteCodeFrom(pasted)).toBe(expected);
  });
});

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
