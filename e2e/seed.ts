import { resetDb } from '@/db/test-db';
import { setupOwnerGroup } from '@/groups/setup';
import { expect, type Page } from '@playwright/test';

export const HOST = { email: 'host@example.com', password: 'e2e-host-password' };

export async function seedGroup(): Promise<{ inviteCode: string }> {
  await resetDb();
  const group = await setupOwnerGroup({ ...HOST, groupName: 'E2E Poker' });
  return { inviteCode: group.inviteCode };
}

export async function signInAsHost(page: Page): Promise<void> {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(HOST.email);
  await page.getByLabel('Password').fill(HOST.password);
  await expect(async () => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/', { timeout: 1000 });
  }).toPass({ timeout: 20_000, intervals: [3000] });
}
