import type { Actor } from '@/access/viewer';
import { getGroup } from '@/groups/groups';
import { closeNight, createNight, setBank, upsertSeat } from '@/nights/nights';
import { addPlayer } from '@/players/players';
import { expect, test, type APIRequestContext } from '@playwright/test';
import { seedGroup } from './seed';

const CRAWLER = 'Mozilla/5.0 facebookexternalhit/1.1 Facebot Twitterbot/1.0';
const OWNER: Actor = { kind: 'owner' };

function openGraph(html: string, property: string): string {
  const match = new RegExp(`<meta property="og:${property}" content="([^"]*)"`).exec(html);
  if (!match) throw new Error(`No og:${property} in the page`);
  return match[1];
}

async function crawl(request: APIRequestContext, path: string) {
  const response = await request.get(path, { headers: { 'user-agent': CRAWLER } });
  expect(response.status(), path).toBe(200);
  const html = await response.text();
  const imageUrl = openGraph(html, 'image');
  const image = await request.get(imageUrl);
  expect(image.status(), imageUrl).toBe(200);
  expect(image.headers()['content-type'], imageUrl).toBe('image/png');
  return { html, imageUrl, title: openGraph(html, 'title'), image: await image.body() };
}

async function seatedPlayer(groupId: string, nightId: string, name: string, cashOutCents: number) {
  const added = await addPlayer({ groupId, name });
  if (added.kind === 'invalid-name') throw new Error(`Could not add ${name}`);
  const seat = {
    groupId,
    nightId,
    playerId: added.player.id,
    buyInCents: 2000,
    cashOutCents,
    expectedUpdatedAt: null,
  };
  await upsertSeat(seat, OWNER);
  return added.player.id;
}

test('a shared night previews as the invite, then as the result', async ({ request }) => {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  const { id: nightId } = await createNight(
    { groupId: group.id, date: '2026-10-17', location: 'Test Kitchen', buyInCents: 2000 },
    OWNER,
  );
  await seatedPlayer(group.id, nightId, 'Ava Stone', 3000);
  const benId = await seatedPlayer(group.id, nightId, 'Ben Hart', 1000);

  const invite = await crawl(request, `/nights/${nightId}`);
  expect(invite.title).toBe('Poker night · Sat, Oct 17 at Test Kitchen');
  expect(invite.html).toContain('What’s the password?');
  expect(invite.html).not.toContain('Ava');

  await setBank({ groupId: group.id, nightId, playerId: benId }, OWNER);
  await closeNight(group.id, nightId);

  const result = await crawl(request, `/nights/${nightId}`);
  expect(result.title).toBe('Ava takes it! · Octagon Poker');
  expect(openGraph(result.html, 'description')).toBe('$40 pot · 2 players');
  expect(result.html).not.toContain('Stone');
  expect(result.image.equals(invite.image)).toBe(false);

  const missing = [
    invite.imageUrl.replace(nightId, 'not-a-night'),
    invite.imageUrl.replace(nightId, '00000000-0000-4000-8000-000000000000'),
  ];
  for (const url of missing) {
    expect((await request.get(url)).status(), url).toBe(404);
  }

  const nightInvite = await crawl(request, `/join/${inviteCode}?night=${nightId}`);
  expect(nightInvite.title).toBe('Ava takes it! · Octagon Poker');

  const groupInvite = await crawl(request, `/join/${inviteCode}`);
  expect(groupInvite.title).toBe('You’re invited to Octagon Poker');
});
