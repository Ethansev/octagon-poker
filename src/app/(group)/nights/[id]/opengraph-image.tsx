import { loadNightResults } from '@/app/(group)/nights/[id]/load-night';
import { NightInviteCard, NightResultCard } from '@/app/(group)/nights/[id]/night-preview';
import { getGroup } from '@/groups/groups';
import { previewSize, renderPreview } from '@/link-previews/preview-card';
import { getNight } from '@/nights/nights';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const alt = 'Poker night summary';
export const size = previewSize;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) return new Response(null, { status: 404 });

  const group = await getGroup();
  const night = await getNight(group.id, id.data);
  if (!night) return new Response(null, { status: 404 });

  if (night.status === 'open') {
    return renderPreview(<NightInviteCard groupName={group.name} night={night} />);
  }
  const results = await loadNightResults(group.id, night);
  return renderPreview(<NightResultCard groupName={group.name} night={night} results={results} />);
}
