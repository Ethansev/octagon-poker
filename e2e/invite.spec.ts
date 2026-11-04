import type { Actor } from '@/access/viewer';
import { getGroup } from '@/groups/groups';
import { addComment, setRsvp } from '@/nights/invites';
import { createNight } from '@/nights/nights';
import { addPlayer, listPlayers } from '@/players/players';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { seedGroup, signInAsHost } from './seed';

const OWNER: Actor = { kind: 'owner' };
const ADDRESS = '1420 Secret Valencia St';
const NOTES = 'Buzz number 3';

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function seedInvite() {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  const { id: nightId } = await createNight(
    {
      groupId: group.id,
      date: daysFromNow(10),
      startTime: '20:30',
      location: 'Sid’s place',
      address: ADDRESS,
      notes: NOTES,
      buyInCents: 5000,
    },
    OWNER,
  );
  return { inviteCode, groupId: group.id, nightId };
}

async function friend(browser: Browser, baseURL: string | undefined, inviteCode: string) {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await page.goto(`/join/${inviteCode}`);
  return { context, page };
}

async function iAm(page: Page, name: string) {
  await page.getByRole('button', { name: "I'm new" }).click();
  await page.getByLabel('Your name').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Hey, who are you?' })).toBeHidden();
}

test('a friend replies to an invite, unlocks the address, and comments', async ({ page }) => {
  const { inviteCode, nightId } = await seedInvite();
  await page.goto(`/join/${inviteCode}?night=${nightId}`);

  await expect(page).toHaveURL(`/nights/${nightId}`);
  await expect(page.getByText(/You’re invited · In \d+ days/)).toBeVisible();
  await expect(page.getByText('8:30pm at Sid’s place')).toBeVisible();
  await expect(page.getByText('Tap “I’m in” to see the address.')).toBeVisible();
  let html = await page.content();
  expect(html).not.toContain(ADDRESS);
  expect(html).not.toContain(NOTES);

  await expect(page.getByRole('group', { name: 'Your reply' })).toHaveCount(0);
  await iAm(page, 'Ava Stone');

  const calendarBefore = await page.request.get(`/nights/${nightId}/calendar`);
  expect(await calendarBefore.text()).not.toContain('Secret');

  await page.getByRole('button', { name: 'Maybe' }).click();
  await expect(page.getByText('Maybe: Ava')).toBeVisible();
  html = await page.content();
  expect(html).not.toContain(ADDRESS);

  await page.getByRole('button', { name: 'I’m in' }).click();
  await expect(page.getByRole('heading', { name: '1 is in' })).toBeVisible();
  await expect(page.getByText(ADDRESS)).toBeVisible();
  await expect(page.getByText(NOTES)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Directions' })).toHaveAttribute(
    'href',
    /google\.com\/maps/,
  );
  const calendar = await page.request.get(`/nights/${nightId}/calendar`);
  expect(calendar.headers()['content-type']).toContain('text/calendar');
  expect(await calendar.text()).toContain('Secret');

  await page.getByLabel('Add a comment').fill('Saving me a seat?');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('Saving me a seat?')).toBeVisible();
  await expect(page.getByLabel('Add a comment')).toHaveValue('');
  await page.reload();
  await expect(page.getByText('Saving me a seat?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'I’m in' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'Delete comment' }).click();
  await expect(page.getByText('Saving me a seat?')).toHaveCount(0);

  await page.getByRole('link', { name: 'Table', exact: true }).click();
  await expect(page).toHaveURL(`/nights/${nightId}?view=table`);
  await expect(page.getByRole('heading', { name: 'Who’s at the table' })).toBeVisible();

  await page.getByRole('link', { name: 'Invite', exact: true }).click();
  await page.getByRole('button', { name: 'Not you?' }).click();
  await expect(page.getByRole('heading', { name: 'Hey, who are you?' })).toBeVisible();
});

test('other friends can’t see an address or delete someone else’s comment', async ({
  browser,
  baseURL,
}) => {
  const { inviteCode, groupId, nightId } = await seedInvite();
  const added = await addPlayer({ groupId, name: 'Ava Stone' });
  if (added.kind !== 'added') throw new Error('expected added');
  await setRsvp({ groupId, nightId, playerId: added.player.id, response: 'going' });
  await addComment({ groupId, nightId, playerId: added.player.id, body: 'First!' });

  const ben = await friend(browser, baseURL, inviteCode);
  await ben.page.goto(`/nights/${nightId}`);
  await iAm(ben.page, 'Ben Hart');
  await expect(ben.page.getByText('First!')).toBeVisible();
  await expect(ben.page.getByRole('heading', { name: '1 is in' })).toBeVisible();
  await expect(ben.page.getByRole('button', { name: 'Delete comment' })).toHaveCount(0);
  expect(await ben.page.content()).not.toContain(ADDRESS);
  await ben.context.close();
});

test('the table fills up, and overflow lines up underneath', async ({ page }) => {
  const { inviteCode, groupId, nightId } = await seedInvite();
  for (let index = 0; index < 12; index++) {
    await addPlayer({ groupId, name: `Player ${String(index).padStart(2, '0')}` });
  }
  for (const player of await listPlayers(groupId)) {
    await setRsvp({ groupId, nightId, playerId: player.id, response: 'going' });
  }

  await page.goto(`/join/${inviteCode}`);
  await page.goto(`/nights/${nightId}`);
  await expect(page.getByRole('heading', { name: '12 are in' })).toBeVisible();
  await expect(page.getByText('Everyone else rotates in.')).toBeVisible();
  await expect(page.getByText(/of 10 seats/)).toHaveCount(0);
});

test('the host lands on the table, sees the address, and sets it from the form', async ({
  page,
}) => {
  const { nightId } = await seedInvite();
  await signInAsHost(page);

  await page.goto(`/nights/${nightId}`);
  await expect(page.getByRole('heading', { name: 'Who’s at the table' })).toBeVisible();

  await page.getByRole('link', { name: 'Invite', exact: true }).click();
  await expect(page.getByText(ADDRESS)).toBeVisible();
  await expect(page.getByText(/tap “This is me”/)).toBeVisible();

  await page.getByLabel('Add a comment').fill('Doors at 8');
  await page.getByRole('button', { name: 'Post' }).click();
  await expect(page.getByText('The host', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Doors at 8')).toBeVisible();

  await page.getByRole('button', { name: 'Edit details' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel(/Address/)).toHaveValue(ADDRESS);
  await dialog.getByLabel(/Address/).fill('99 New Street');
  await dialog.getByRole('button', { name: 'Save details' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText('99 New Street')).toBeVisible();
});

test('an address never reaches a link preview', async ({ request }) => {
  const { nightId } = await seedInvite();
  const crawler = { 'user-agent': 'facebookexternalhit/1.1' };

  const html = await (await request.get(`/nights/${nightId}`, { headers: crawler })).text();
  expect(html).toContain('Sid’s place');
  expect(html).not.toContain(ADDRESS);
  expect(html).not.toContain(NOTES);
});
