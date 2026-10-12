import { test, expect } from '@playwright/test';

// A `type: UI` mount (sample1's yaml-mixed.ui.yaml) in a deployment that also has @UI classes:
// every Java adapter used to stand its YAML surface down as soon as a generated controller existed,
// so the mount answered 404 (owner decision 4, 2026-10-12: serve both).

test.describe('a YAML mount next to @UI classes (/yaml-mixed)', () => {

  test('the mount root opens its home page', async ({ page }) => {
    const response = await page.goto('/yaml-mixed');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Served next to the classes' })).toBeVisible();
  });

  test('a deep link into the mount is the mount, not the root @UI', async ({ page }) => {
    await page.goto('/yaml-mixed/welcome');
    await expect(page.getByRole('heading', { name: 'Served next to the classes' })).toBeVisible();
    await expect(page.getByText('A YAML mount in a deployment that also has @UI classes.')).toBeVisible();
  });

  test('the @UI classes keep their own paths', async ({ page }) => {
    await page.goto('/walk-yaml');
    await expect(page.getByRole('heading', { name: 'YAML booking' })).toBeVisible();
  });
});
