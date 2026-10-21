import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
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
};
