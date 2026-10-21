import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('health check failed', error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
