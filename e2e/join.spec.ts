import { expect, test } from '@playwright/test';
import { seedGroup } from './seed';

test('a locked-out friend gets back in by pasting the group link', async ({ page }) => {
  const { inviteCode } = await seedGroup();

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ask for the group link' })).toBeVisible();

  const link = page.getByLabel('Group link');
  await link.fill('https://poker.example.com/join/not-the-current-code-000');
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(
    page.getByText('That link doesn’t open this group. Ask for the latest one.'),
  ).toBeVisible();

  await link.fill(`Here you go: https://poker.example.com/join/${inviteCode} see you Friday`);
  await page.getByRole('button', { name: 'Join' }).click();
  await expect(page.getByRole('link', { name: 'E2E Poker' })).toBeVisible();
  await expect(page).toHaveURL('/');
});
