import { z } from 'zod';

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  GROUP_TIME_ZONE: z
    .string()
    .refine(isTimeZone, 'must be an IANA time zone')
    .default('America/Los_Angeles'),
});

type Env = z.infer<typeof envSchema>;

let parsed: Env | null = null;

function read(): Env {
  parsed ??= envSchema.parse(process.env);
  return parsed;
}

export const env: Env = {
  get DATABASE_URL() {
    return read().DATABASE_URL;
  },
  get BETTER_AUTH_SECRET() {
    return read().BETTER_AUTH_SECRET;
  },
  get BETTER_AUTH_URL() {
    return read().BETTER_AUTH_URL;
  },
  get GROUP_TIME_ZONE() {
    return read().GROUP_TIME_ZONE;
  },
};
