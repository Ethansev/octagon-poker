import type { Actor } from '@/access/viewer';
import { getGroup } from '@/groups/groups';
import { createNight } from '@/nights/nights';
import { expect, test } from '@playwright/test';
import { seedGroup, signInAsHost } from './seed';

const OWNER: Actor = { kind: 'owner' };

function daysFromNow(days: number): string {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

test('a future night reads as upcoming and doesn’t hide a live one', async ({ page }) => {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  const { id: liveId } = await createNight(
    { groupId: group.id, date: daysFromNow(-3), location: 'Live Kitchen', buyInCents: 2000 },
    OWNER,
  );
  await createNight(
    { groupId: group.id, date: daysFromNow(30), location: 'Later Kitchen', buyInCents: 2000 },
    OWNER,
  );
  const { id: nextId } = await createNight(
    {
      groupId: group.id,
      date: daysFromNow(7),
      startTime: '20:30',
      location: 'Next Kitchen',
      buyInCents: 2000,
    },
    OWNER,
  );

  await page.goto(`/join/${inviteCode}`);
  await expect(page.getByRole('link', { name: /Live Kitchen is dealing/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Next game.*Next Kitchen/ })).toBeVisible();

  await page.goto(`/nights/${nextId}?view=table`);
  await expect(page.getByText('Upcoming', { exact: true })).toBeVisible();
  await expect(page.getByText(/8:30pm/)).toBeVisible();
  await expect(page.getByText('Live', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Live books')).toHaveCount(0);
  await expect(page.getByLabel('Night stats').getByText('pot')).toHaveCount(0);
  await expect(page.getByLabel('Night stats').getByText('buy-in')).toBeVisible();

  await page.goto(`/nights/${liveId}`);
  await expect(page.getByText('Live', { exact: true })).toBeVisible();
});

test('the host sets and changes a start time', async ({ page }) => {
  await seedGroup();
  await signInAsHost(page);

  await page.goto('/nights/new');
  await page.getByLabel('When').fill(daysFromNow(7));
  await page.getByLabel(/Starts at/).fill('20:30');
  await page.getByLabel(/Where/).fill('Test Kitchen');
  await page.getByRole('button', { name: 'Deal the night' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test Kitchen');
  await expect(page.getByText(/· 8:30pm/)).toBeVisible();

  await page.getByRole('button', { name: 'Edit details' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel(/Starts at/)).toHaveValue('20:30');
  await dialog.getByLabel(/Starts at/).fill('19:00');
  await dialog.getByRole('button', { name: 'Save details' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(/· 7pm/)).toBeVisible();

  await page.getByRole('button', { name: 'Edit details' }).click();
  await page
    .getByRole('dialog')
    .getByLabel(/Starts at/)
    .fill('');
  await page.getByRole('dialog').getByRole('button', { name: 'Save details' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByText(/· 7pm/)).toHaveCount(0);
});
