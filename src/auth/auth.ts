import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema } from '@/db/client';

export function createAuth(options: { allowSignUp: boolean }) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: { enabled: true, disableSignUp: !options.allowSignUp },
    plugins: [nextCookies()],
  });
}

export const auth = createAuth({ allowSignUp: false });
