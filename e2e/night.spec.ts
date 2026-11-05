import { getGroup } from '@/groups/groups';
import { createNight } from '@/nights/nights';
import { addPlayer as addPlayerRecord } from '@/players/players';
import { expect, test, type Page } from '@playwright/test';
import { seedGroup, signInAsHost } from './seed';

async function addPlayer(page: Page, name: string, existing: boolean) {
  await page.getByRole('button', { name: 'Add player' }).click();
  await page.getByPlaceholder('Search or add a name').fill(name);
  await page.getByRole('option', { name: existing ? name : `Add “${name}”` }).click();
  await page.getByRole('button', { name: 'Add 1 player' }).click();
  await expect(seatCard(page, name)).toContainText('$20 in');
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
  await page.getByLabel('When').fill('2026-10-17');
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
  await addPlayer(page, 'Ben', false);
  await addPlayer(page, 'Cal', false);

  await page.getByRole('combobox', { name: 'Who’s holding the bank' }).click();
  await page.getByRole('option', { name: 'Ben' }).click();
  await expect(page.getByText('Ben should be holding $60')).toBeVisible();
  await expect(seatCard(page, 'Ben')).toContainText('Bank');

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
  await expect(page.getByText('Ben should be holding $80')).toBeVisible();
  await expect(page.getByRole('button', { name: /Close the night/ })).toHaveCount(0);

  const host = page;
  await signInAsHost(host);

  await host.goto(nightUrl);
  await host.getByRole('button', { name: /Close the night/ }).click();
  await expect(host.getByText('Ava takes it!')).toBeVisible();
  await expect(host.getByText('In the books')).toBeVisible();

  await host.goto('/');
  await host.getByRole('link', { name: /Ben still owes 2 people \$80/ }).click();
  await expect(host.getByRole('heading', { name: 'Ben owes $80' })).toBeVisible();
  await host.getByRole('button', { name: 'Mark paid for Ava' }).click();
  await expect(host.getByRole('heading', { name: 'Ben owes $10' })).toBeVisible();
  const saved = host.waitForResponse((response) => response.request().method() === 'POST');
  await host.getByRole('button', { name: 'Mark paid for Cal' }).click();
  await saved;
  await expect(host.getByRole('heading', { name: 'Ben paid everyone out' })).toBeVisible();
  await host.reload();
  await expect(host.getByRole('heading', { name: 'Ben paid everyone out' })).toBeVisible();
  await expect(host.getByText('Ava got paid $70')).toBeVisible();

  await host.goto('/');
  await expect(host.getByRole('heading', { name: 'Ava took the night' })).toBeVisible();
  await expect(host.getByText(/still owes/)).toHaveCount(0);

  await host.goto(nightUrl);
  await host.getByRole('button', { name: 'Reopen night' }).click();
  await expect(host.getByText('Live', { exact: true })).toBeVisible();
  await expect(host.getByRole('button', { name: /Close the night/ })).toBeEnabled();

  await host.getByRole('button', { name: 'Delete night' }).click();
  await host.getByRole('alertdialog').getByRole('button', { name: 'Delete night' }).click();
  await expect(host).toHaveURL('/');
  await expect(host.getByText('Test Kitchen')).toHaveCount(0);
});

test('adding several players at once seats them all at the buy-in', async ({ page }) => {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  await addPlayerRecord({ groupId: group.id, name: 'Ava' });
  await addPlayerRecord({ groupId: group.id, name: 'Ben' });
  const { id } = await createNight(
    { groupId: group.id, date: '2026-10-17', location: 'Test Kitchen', buyInCents: 2000 },
    { kind: 'owner' },
  );

  await page.goto(`/join/${inviteCode}`);
  await page.goto(`/nights/${id}`);
  await page.getByRole('button', { name: 'Add player' }).click();
  await page.getByRole('option', { name: 'Ava' }).click();
  await page.getByRole('option', { name: 'Ben' }).click();
  await page.getByPlaceholder('Search or add a name').fill('Cal');
  await page.getByRole('option', { name: 'Add “Cal”' }).click();
  await expect(page.getByRole('option', { name: /Cal/ })).toBeVisible();
  await page.getByRole('option', { name: 'Ben' }).click();
  await page.getByRole('option', { name: 'Ben' }).click();
  await page.getByRole('button', { name: 'Add 3 players' }).click();

  for (const name of ['Ava', 'Ben', 'Cal']) {
    await expect(seatCard(page, name)).toContainText('$20 in');
  }
  await page.reload();
  for (const name of ['Ava', 'Ben', 'Cal']) {
    await expect(seatCard(page, name)).toContainText('$20 in');
  }
  await expect(page.getByText('Ben took a seat with $20')).toBeVisible();
});

test('a night with no typical buy-in still adds one player at a time', async ({ page }) => {
  const { inviteCode } = await seedGroup();
  const group = await getGroup();
  await addPlayerRecord({ groupId: group.id, name: 'Ava' });
  const { id } = await createNight(
    { groupId: group.id, date: '2026-10-17', location: 'Test Kitchen', buyInCents: null },
    { kind: 'owner' },
  );

  await page.goto(`/join/${inviteCode}`);
  await page.goto(`/nights/${id}`);
  await page.getByRole('button', { name: 'Add player' }).click();
  await page.getByRole('option', { name: 'Ava' }).click();
  await expect(seatForm(page, 'Ava')).toBeVisible();
});
