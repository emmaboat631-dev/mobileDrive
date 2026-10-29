import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config.
 *
 * The CI run starts its own dev server (`webServer`) and reuses one that
 * is already up locally so `npm run test:e2e` works both ways. Tests live
 * in `e2e/` and run against Chromium by default — add webkit / firefox
 * if you need multi-engine coverage later.
 */

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  // Serial so each route compiles once in Next's dev cache instead of three
  // workers racing to compile the same page.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
