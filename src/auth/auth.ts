import { db, schema } from '@/db/client';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

export function createAuth(options: { allowSignUp: boolean }) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    session: { expiresIn: 60 * 60 * 24 * 365 },
    emailAndPassword: { enabled: true, disableSignUp: !options.allowSignUp },
    plugins: [nextCookies()],
  });
}

export const auth = createAuth({ allowSignUp: false });
