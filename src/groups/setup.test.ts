import { user } from '@/auth/schema';
import { db } from '@/db/client';
import { resetDb } from '@/db/test-db';
import { groups } from '@/groups/schema';
import { readOwnerSetup, setupOwnerGroup } from '@/groups/setup';
import { beforeEach, describe, expect, it } from 'vitest';

describe('readOwnerSetup', () => {
  it.each([
    {
      name: 'everything is set',
      vars: {
        OWNER_EMAIL: 'host@example.com',
        OWNER_PASSWORD: 'hunter22hunter22',
        GROUP_NAME: 'Friday',
      },
      expected: { email: 'host@example.com', password: 'hunter22hunter22', groupName: 'Friday' },
    },
    { name: 'nothing is set', vars: {}, expected: null },
    {
      name: 'the password was removed after setup',
      vars: { OWNER_EMAIL: 'host@example.com', GROUP_NAME: 'Friday' },
      expected: null,
    },
  ])('$name', ({ vars, expected }) => {
    expect(readOwnerSetup(vars)).toEqual(expected);
  });

  it.each([
    {
      name: 'a password without an email',
      vars: { OWNER_PASSWORD: 'hunter22hunter22', GROUP_NAME: 'Friday' },
      message: 'OWNER_EMAIL is not set',
    },
    {
      name: 'a password without a group name',
      vars: { OWNER_PASSWORD: 'hunter22hunter22', OWNER_EMAIL: 'host@example.com' },
      message: 'GROUP_NAME is not set',
    },
  ])('rejects $name', ({ vars, message }) => {
    expect(() => readOwnerSetup(vars)).toThrow(message);
  });
});

describe('setupOwnerGroup', () => {
  beforeEach(resetDb);

  const setup = { email: 'host@example.com', password: 'hunter22hunter22', groupName: 'Friday' };

  it('creates the owner account and the group', async () => {
    const group = await setupOwnerGroup(setup);
    const [owner] = await db.select().from(user);

    expect(group.name).toBe('Friday');
    expect(group.ownerUserId).toBe(owner.id);
    expect(owner.email).toBe('host@example.com');
  });

  it('reuses the owner and group on every later deploy', async () => {
    const first = await setupOwnerGroup(setup);
    const second = await setupOwnerGroup({ ...setup, groupName: 'Renamed' });

    expect(second).toEqual(first);
    expect(await db.$count(user)).toBe(1);
    expect(await db.$count(groups)).toBe(1);
  });
});
