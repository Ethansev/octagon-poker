import type { Actor } from '@/access/viewer';
import { getGroup } from '@/groups/groups';
import { closeNight, createNight, setBank, upsertSeat } from '@/nights/nights';
import { addContact, listPlayers } from '@/players/players';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { seedGroup, signInAsHost } from './seed';

const OWNER: Actor = { kind: 'owner' };
const SECRET_VENMO = 'ava-secret-venmo';
const SECRET_ZELLE = 'ava-secret@example.com';

async function seedNights() {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  await addContact({ groupId: group.id, name: 'Ava', venmo: SECRET_VENMO, zelle: SECRET_ZELLE });
  await addContact({ groupId: group.id, name: 'Ben', venmo: '', zelle: '' });
  await addContact({ groupId: group.id, name: 'Sid', venmo: '', zelle: '' });
  const players = await listPlayers(group.id);
  const idOf = (name: string) => {
    const player = players.find((candidate) => candidate.name === name);
    if (!player) throw new Error(`No player ${name}`);
    return player.id;
  };

  const { id: closedId } = await createNight(
    { groupId: group.id, date: '2026-03-07', location: 'Closed Kitchen', buyInCents: 2000 },
    OWNER,
  );
  const results = [
    { name: 'Ava', cashOutCents: 3000 },
    { name: 'Ben', cashOutCents: 2000 },
    { name: 'Sid', cashOutCents: 1000 },
  ];
  for (const { name, cashOutCents } of results) {
    await upsertSeat(
      {
        groupId: group.id,
        nightId: closedId,
        playerId: idOf(name),
        buyInCents: 2000,
        cashOutCents,
        expectedUpdatedAt: null,
      },
      OWNER,
    );
  }
  await setBank({ groupId: group.id, nightId: closedId, playerId: idOf('Sid') }, OWNER);
  await closeNight(group.id, closedId);

  const { id: openId } = await createNight(
    { groupId: group.id, date: '2026-03-14', location: 'Open Kitchen', buyInCents: 2000 },
    OWNER,
  );
  await upsertSeat(
    {
      groupId: group.id,
      nightId: openId,
      playerId: idOf('Ava'),
      buyInCents: 2000,
      cashOutCents: null,
      expectedUpdatedAt: null,
    },
    OWNER,
  );
  return { inviteCode, closedId, openId, idOf };
}

async function joinAs(
  page: Page,
  context: BrowserContext,
  inviteCode: string,
  playerId: string,
): Promise<void> {
  await page.goto(`/join/${inviteCode}`);
  const origin = new URL(page.url()).origin;
  await context.addCookies([{ name: 'op_player', value: playerId, url: origin }]);
}

test('payment info stays out of what ordinary members are sent', async ({ context, page }) => {
  const { inviteCode, closedId, openId, idOf } = await seedNights();
  await joinAs(page, context, inviteCode, idOf('Ben'));

  const pages = ['/', `/nights/${closedId}`, `/nights/${openId}`, `/players/${idOf('Ava')}`];
  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    const html = await page.content();
    expect(html, path).not.toContain(SECRET_VENMO);
    expect(html, path).not.toContain(SECRET_ZELLE);
  }

  const players = await page.goto('/players');
  expect(players?.status()).toBe(404);
  expect(await page.content()).not.toContain(SECRET_VENMO);
});

test('the bank sees who to pay, copies it, and fills in what’s missing', async ({
  context,
  page,
}) => {
  const { inviteCode, closedId, idOf } = await seedNights();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await joinAs(page, context, inviteCode, idOf('Sid'));

  await page.goto(`/nights/${closedId}`);
  await expect(page.getByRole('link', { name: 'Open Ava’s Venmo' })).toHaveAttribute(
    'href',
    `https://venmo.com/u/${SECRET_VENMO}`,
  );
  await page.getByRole('button', { name: new RegExp(`Zelle.*${SECRET_ZELLE}`) }).click();
  await expect(page.getByText('Copied')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(SECRET_ZELLE);

  await page.getByRole('button', { name: 'Add Venmo or Zelle for Ben' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Venmo').fill('not a username');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog.getByText(/Just the username/)).toBeVisible();
  await dialog.getByLabel('Venmo').fill('@ben-venmo');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('link', { name: 'Open Ben’s Venmo' })).toHaveAttribute(
    'href',
    'https://venmo.com/u/ben-venmo',
  );

  await page.reload();
  await expect(page.getByText('Ben’s payment info changed')).toBeVisible();
  expect(await page.content()).not.toContain('@ben-venmo');
});

test('the host keeps the player list', async ({ page }) => {
  const { closedId } = await seedNights();

  await signInAsHost(page);

  await page.goto('/settings');
  await page
    .getByRole('link', { name: /Players/ })
    .last()
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Players' })).toBeVisible();

  const ava = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Ava' }) });
  await expect(ava.getByText('+$10 all time')).toBeVisible();
  await expect(ava.getByText(SECRET_VENMO)).toBeVisible();

  await page.getByRole('button', { name: 'Add player' }).click();
  const addDialog = page.getByRole('dialog');
  await addDialog.getByLabel('Name').fill('Ava');
  await addDialog.getByRole('button', { name: 'Add player' }).click();
  await expect(addDialog.getByText('Someone already has that name.')).toBeVisible();
  await addDialog.getByLabel('Name').fill('Dev Patel');
  await addDialog.getByLabel('Venmo').fill('dev-p');
  await addDialog.getByRole('button', { name: 'Add player' }).click();
  await expect(addDialog).toBeHidden();

  const dev = page.getByRole('listitem').filter({
    has: page.getByRole('link', { name: 'Dev Patel' }),
  });
  await expect(dev.getByText('dev-p')).toBeVisible();
  await expect(dev.getByText('No nights yet')).toBeVisible();

  await page.getByRole('button', { name: 'Edit Dev Patel' }).click();
  const editDialog = page.getByRole('dialog');
  await editDialog.getByLabel('Name').fill('Dev');
  await editDialog.getByLabel('Zelle').fill('415-555-0100');
  await editDialog.getByRole('button', { name: 'Save' }).click();
  await expect(editDialog).toBeHidden();
  const renamed = page.getByRole('listitem').filter({
    has: page.getByRole('link', { name: 'Dev', exact: true }),
  });
  await expect(renamed.getByText('415-555-0100')).toBeVisible();

  await renamed.getByRole('button', { name: 'This is me' }).click();
  await expect(renamed.getByRole('button', { name: 'You' })).toBeVisible();

  await page.goto(`/nights/${closedId}`);
  await expect(page.getByRole('link', { name: 'Open Ava’s Venmo' })).toBeVisible();
});
