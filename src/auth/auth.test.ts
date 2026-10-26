import { createAuth } from '@/auth/auth';
import { resetDb } from '@/db/test-db';
import { beforeEach, describe, expect, it } from 'vitest';

const credentials = { email: 'host@example.com', password: 'hunter22hunter22' };

describe('host session', () => {
  beforeEach(async () => {
    await resetDb();
    await createAuth({ allowSignUp: true }).api.signUpEmail({
      body: { ...credentials, name: 'Host' },
    });
  });

  it('keeps the host signed in for a year', async () => {
    const response = await createAuth({ allowSignUp: false }).api.signInEmail({
      body: credentials,
      asResponse: true,
    });

    expect(response.headers.get('set-cookie')).toContain('Max-Age=31536000');
  });
});
