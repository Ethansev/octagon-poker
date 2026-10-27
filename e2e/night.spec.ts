import { expect, test, type Page } from '@playwright/test';
import { HOST, seedGroup } from './seed';

async function addPlayer(page: Page, name: string, existing: boolean) {
  await page.getByRole('button', { name: 'Add player' }).click();
  await page.getByPlaceholder('Search or add a name').fill(name);
  await page.getByRole('option', { name: existing ? name : `Add “${name}”` }).click();
}

function seatForm(page: Page, name: string) {
  return page.getByRole('form', { name: `${name}'s seat` });
}

function seatCard(page: Page, name: string) {
  return page.getByRole('listitem').filter({ has: page.getByText(name, { exact: true }) });
}

async function openSeat(page: Page, name: string) {
  await seatCard(page, name).getByRole('button').click();
  await expect(seatForm(page, name)).toBeVisible();
}

async function lockIn(page: Page, name: string, summary: string) {
  await seatForm(page, name).getByRole('button', { name: 'Lock it in' }).click();
  await expect(seatCard(page, name)).toContainText(summary);
}

test('a night goes from deal to delete', async ({ page }) => {
  const { inviteCode } = await seedGroup();

  await page.goto(`/join/${inviteCode}`);
  await expect(page).toHaveURL('/');

  await page.goto('/nights/new');
  await page.getByLabel(/Where/).fill('Test Kitchen');
  await page.getByLabel(/Typical buy-in/).fill('20');
  await page.getByRole('button', { name: 'Deal the night' }).click();
  await expect(page).toHaveURL(/\/nights\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test Kitchen');
  const nightUrl = page.url();

  await page.getByRole('button', { name: "I'm new" }).click();
  await page.getByLabel('Your name').fill('Ava');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Hey, who are you?' })).toBeHidden();

  await addPlayer(page, 'Ava', true);
  await lockIn(page, 'Ava', '$20 in');
  await addPlayer(page, 'Ben', false);
  await lockIn(page, 'Ben', '$20 in');
  await addPlayer(page, 'Cal', false);
  await lockIn(page, 'Cal', '$20 in');

  await page.getByRole('combobox', { name: 'Who’s holding the bank' }).click();
  await page.getByRole('option', { name: 'Ava' }).click();
  await expect(page.getByText('Ava should be holding $60')).toBeVisible();
  await expect(seatCard(page, 'Ava')).toContainText('Bank');

  await openSeat(page, 'Ava');
  await seatForm(page, 'Ava').getByRole('button', { name: /Rebuy/ }).click();
  await seatForm(page, 'Ava').getByLabel('Cashing out with').fill('70');
  await expect(seatForm(page, 'Ava')).toContainText('That’s +$30 on the night');
  await lockIn(page, 'Ava', '$40 in · $70 out');

  await openSeat(page, 'Ben');
  await seatForm(page, 'Ben').getByRole('button', { name: 'Busted' }).click();
  await lockIn(page, 'Ben', '$20 in · $0 out');

  await openSeat(page, 'Cal');
  await seatForm(page, 'Cal').getByLabel('Cashing out with').fill('10');
  await lockIn(page, 'Cal', '$20 in · $10 out');

  await expect(page.getByText('3 of 3 cashed out')).toBeVisible();
  await expect(page.getByText('Ava should be holding $80')).toBeVisible();
  await expect(page.getByRole('button', { name: /Close the night/ })).toHaveCount(0);

  const host = page;
  await host.goto('/sign-in');
  await host.getByLabel('Email').fill(HOST.email);
  await host.getByLabel('Password').fill(HOST.password);
  await host.getByRole('button', { name: 'Sign in' }).click();
  await expect(host).toHaveURL('/');

  await host.goto(nightUrl);
  await host.getByRole('button', { name: /Close the night/ }).click();
  await expect(host.getByText('Ava takes it!')).toBeVisible();
  await expect(host.getByText('In the books')).toBeVisible();

  await host.goto('/');
  await expect(host.getByRole('heading', { name: 'Ava took the night' })).toBeVisible();

  await host.goto(nightUrl);
  await host.getByRole('button', { name: 'Reopen night' }).click();
  await expect(host.getByText('Live', { exact: true })).toBeVisible();
  await expect(host.getByRole('button', { name: /Close the night/ })).toBeEnabled();

  await host.getByRole('button', { name: 'Delete night' }).click();
  await host.getByRole('alertdialog').getByRole('button', { name: 'Delete night' }).click();
  await expect(host).toHaveURL('/');
  await expect(host.getByText('Test Kitchen')).toHaveCount(0);
});
