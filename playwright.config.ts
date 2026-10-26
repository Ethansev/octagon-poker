import { defineConfig, devices } from '@playwright/test';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch {}

const PORT = 3411;
const BASE_URL = `http://localhost:${PORT}`;

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is not set');

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.BETTER_AUTH_URL = BASE_URL;
process.env.BETTER_AUTH_SECRET ??= 'e2e-secret-at-least-32-characters-long';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `node scripts/migrate.mjs && ${process.env.CI ? '' : 'npm run build && '}npx next start -p ${PORT}`,
    url: `${BASE_URL}/api/health`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      BETTER_AUTH_URL: BASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    },
  },
});
