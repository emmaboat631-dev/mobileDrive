import { test, expect } from '@playwright/test';

/**
 * Golden-path E2E: every critical public route renders without a server
 * error, hydration mismatch, or missing content. We navigate to each route
 * directly rather than clicking from the Nav because Next's dev server
 * compiles each route on first visit, which can take 10–20s on a cold
 * boot and makes click-driven tests flaky. If any of these ever go red,
 * something broke on that page.
 */

// Give dev-mode first-compile room to breathe.
test.setTimeout(90_000);

test.describe('mobileDrive public routes render', () => {
  test('home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/mobileDrive/);
    await expect(page.locator('body')).toContainText(/mobileDrive/i);
  });

  test('vehicles marketplace', async ({ page }) => {
    await page.goto('/vehicles', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: /view vehicle/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('vehicle detail page', async ({ page }) => {
    await page.goto('/vehicles/ford-mustang', { waitUntil: 'domcontentloaded' });
    // "Customize Vehicle" is a Next.js <Link>, so it matches role=link not button.
    await expect(page.getByRole('link', { name: /customize vehicle/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('configurator', async ({ page }) => {
    await page.goto('/configure/ford-mustang', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('test-drive route is auth-gated', async ({ page }) => {
    // Unauthenticated visits to /test-drive/* must redirect to /sign-in.
    // middleware.ts enforces this; losing the gate would let anyone book
    // against another user's identity.
    await page.goto('/test-drive/ford-mustang', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('legal pages', async ({ page }) => {
    for (const path of ['/legal/privacy', '/legal/terms', '/legal/cookies']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 });
    }
  });
});
