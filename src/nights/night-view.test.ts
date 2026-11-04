import { nightView } from '@/nights/night-view';
import { describe, expect, it } from 'vitest';

describe('nightView', () => {
  it.each([
    {
      name: 'a friend sees the invite before it starts',
      role: 'member',
      phase: 'upcoming',
      requested: undefined,
      expected: 'invite',
    },
    {
      name: 'a friend lands on the table once it’s live',
      role: 'member',
      phase: 'live',
      requested: undefined,
      expected: 'table',
    },
    {
      name: 'a friend lands on the results once it closes',
      role: 'member',
      phase: 'closed',
      requested: undefined,
      expected: 'table',
    },
    {
      name: 'the host lands on the table even before it starts',
      role: 'owner',
      phase: 'upcoming',
      requested: undefined,
      expected: 'table',
    },
    {
      name: 'a friend can switch to the table early',
      role: 'member',
      phase: 'upcoming',
      requested: 'table',
      expected: 'table',
    },
    {
      name: 'the host can look at the invite',
      role: 'owner',
      phase: 'live',
      requested: 'invite',
      expected: 'invite',
    },
    {
      name: 'a made-up view falls back to the default',
      role: 'member',
      phase: 'upcoming',
      requested: 'nonsense',
      expected: 'invite',
    },
  ] satisfies {
    name: string;
    role: 'owner' | 'member';
    phase: 'upcoming' | 'live' | 'closed';
    requested: string | undefined;
    expected: string;
  }[])('$name', ({ role, phase, requested, expected }) => {
    expect(nightView(requested, role, phase)).toBe(expected);
  });
});
