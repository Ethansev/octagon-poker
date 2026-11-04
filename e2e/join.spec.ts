import type { Actor } from '@/access/viewer';
import { getGroup } from '@/groups/groups';
import { createNight } from '@/nights/nights';
import { expect, test } from '@playwright/test';
import { seedGroup } from './seed';

const OWNER: Actor = { kind: 'owner' };

async function seedNight() {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  const { id } = await createNight(
    { groupId: group.id, date: '2026-10-17', location: 'Test Kitchen', buyInCents: 2000 },
    OWNER,
  );
  return { inviteCode, nightId: id };
}

test('a locked-out friend gets in with the password and stays on the page', async ({ page }) => {
  const { nightId } = await seedNight();

  await page.goto(`/nights/${nightId}`);
  await expect(page.getByRole('heading', { name: 'What’s the password?' })).toBeVisible();

  const entry = page.getByLabel('Group password');
  await entry.fill('not-the-password');
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page.getByText('That’s not it. Ask the host for the password.')).toBeVisible();

  await entry.fill('E2E-Group-Password');
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test Kitchen');
  await expect(page).toHaveURL(`/nights/${nightId}`);
});

test('pasting the group link still lets a friend in', async ({ page }) => {
  const { inviteCode } = await seedGroup();

  await page.goto('/');
  await page
    .getByLabel('Group password')
    .fill(`Here you go: https://poker.example.com/join/${inviteCode} see you Friday`);
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page.getByRole('link', { name: 'E2E Poker' })).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('a night invite brings a new friend straight to that night', async ({
  browser,
  context,
  page,
}, testInfo) => {
  const { inviteCode, nightId } = await seedNight();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: async ({ url }: { url: string }) => {
        document.documentElement.dataset.sharedUrl = url;
      },
    });
  });

  await page.goto(`/join/${inviteCode}`);
  await page.goto(`/nights/${nightId}`);
  await page.getByRole('button', { name: 'Invite' }).click();

  const expected = new RegExp(`/join/${inviteCode}\\?night=${nightId}$`);
  let link: string;
  if (testInfo.project.name === 'phone') {
    await expect(page.locator('html')).toHaveAttribute('data-shared-url', expected);
    link = await page.evaluate(() => document.documentElement.dataset.sharedUrl ?? '');
  } else {
    await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible();
    link = await page.evaluate(() => navigator.clipboard.readText());
    expect(link).toMatch(expected);
  }

  const friend = await browser.newContext();
  const friendPage = await friend.newPage();
  await friendPage.goto(link);
  await expect(friendPage.getByRole('heading', { level: 1 })).toHaveText('Test Kitchen');
  expect(new URL(friendPage.url()).pathname).toBe(`/nights/${nightId}`);
  await friend.close();
});
