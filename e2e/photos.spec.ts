import { getGroup } from '@/groups/groups';
import { addContact, listPlayers } from '@/players/players';
import { expect, test } from '@playwright/test';
import { seedGroup, signInAsHost } from './seed';

const RED_DOT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
  'base64',
);

test('the host adds a photo, and the group sees it in place of initials', async ({
  page,
  browser,
  baseURL,
}) => {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  await addContact({ groupId: group.id, name: 'Ava Stone', venmo: '', zelle: '' });
  const [ava] = await listPlayers(group.id);
  const photoPath = `/players/${ava.id}/photo`;
  const avatarPhoto = `img[src^="${photoPath}"]`;

  await signInAsHost(page);
  await page.goto('/players');
  await page.getByRole('button', { name: 'Edit Ava Stone' }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByLabel('Photo of Ava Stone')
    .setInputFiles({ name: 'ava.png', mimeType: 'image/png', buffer: RED_DOT_PNG });
  await expect(dialog.getByRole('button', { name: 'Change photo' })).toBeVisible();
  await expect(dialog.locator(avatarPhoto)).toBeVisible();

  const photo = await page.request.get(photoPath);
  expect(photo.status()).toBe(200);
  expect(photo.headers()['content-type']).toBe('image/jpeg');
  expect(photo.headers()['cache-control']).toContain('private');

  const stranger = await browser.newContext({ baseURL });
  expect((await stranger.request.get(photoPath)).status()).toBe(404);
  await stranger.close();

  const member = await browser.newContext({ baseURL });
  const memberPage = await member.newPage();
  await memberPage.goto(`/join/${inviteCode}`);
  await memberPage.goto(`/players/${ava.id}`);
  await expect(memberPage.locator(`${avatarPhoto}:visible`).first()).toBeVisible();
  await member.close();

  await dialog.getByRole('button', { name: 'Remove' }).click();
  await expect(dialog.getByRole('button', { name: 'Add photo' })).toBeVisible();
  expect((await page.request.get(photoPath)).status()).toBe(404);
});
