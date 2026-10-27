import { expect, test } from '@playwright/test';
import { z } from 'zod';
import { seedGroup } from './seed';

const manifestSchema = z.object({
  display: z.literal('standalone'),
  start_url: z.literal('/'),
  icons: z.array(z.object({ src: z.string(), sizes: z.string(), purpose: z.string() })),
});

test('the app can be added to a home screen', async ({ page, request }) => {
  await seedGroup();
  await page.goto('/');

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).not.toBeNull();
  const manifest = manifestSchema.parse(await (await request.get(manifestHref ?? '')).json());
  expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual(
    expect.arrayContaining(['512x512 any', '512x512 maskable']),
  );

  const touchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  const iconUrls = [touchIcon ?? '', ...manifest.icons.map((icon) => icon.src)];
  for (const url of iconUrls) {
    const response = await request.get(url);
    expect(response.headers()['content-type'], url).toBe('image/png');
  }
});
