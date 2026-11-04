import { getViewer } from '@/access/viewer';
import { env } from '@/env';
import { listRsvps } from '@/nights/invites';
import { nightCalendarFile } from '@/nights/night-calendar';
import { getNight } from '@/nights/nights';
import { z } from 'zod';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  const id = z.uuid().safeParse((await context.params).id);
  if (!viewer || !id.success) return new Response(null, { status: 404 });

  const night = await getNight(viewer.group.id, id.data);
  if (!night) return new Response(null, { status: 404 });

  const rsvps = await listRsvps(night.id);
  const going = rsvps.some(
    (rsvp) => rsvp.playerId === viewer.playerId && rsvp.response === 'going',
  );
  const seesAddress = viewer.role === 'owner' || going;

  const file = nightCalendarFile({
    id: night.id,
    date: night.date,
    startTime: night.startTime,
    title: `Poker night${night.location ? ` at ${night.location}` : ''}`,
    place: (seesAddress ? night.address : null) ?? night.location,
    url: `${env.BETTER_AUTH_URL}/nights/${night.id}`,
    now: new Date(),
  });
  return new Response(file, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'attachment; filename="poker-night.ics"',
      'cache-control': 'private, no-store',
    },
  });
}
