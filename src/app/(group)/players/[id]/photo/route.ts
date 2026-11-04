import { getViewer } from '@/access/viewer';
import { getPlayerPhoto } from '@/players/player-photos';
import { z } from 'zod';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  const id = z.uuid().safeParse((await context.params).id);
  if (!viewer || !id.success) return new Response(null, { status: 404 });

  const photo = await getPlayerPhoto(viewer.group.id, id.data);
  if (!photo) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(photo), {
    headers: {
      'content-type': 'image/jpeg',
      'cache-control': 'private, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
