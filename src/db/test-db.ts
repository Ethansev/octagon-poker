import { sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { db, schema } from '@/db/client';

export async function resetDb(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE ${sql.join(
      Object.values(schema)
        .filter((table) => table instanceof PgTable)
        .map((table) => sql`${table}`),
      sql`, `,
    )} RESTART IDENTITY CASCADE`,
  );
}
