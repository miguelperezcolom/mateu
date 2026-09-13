import { test, expect } from '@playwright/test';

/**
 * Renderer-agnostic smoke suite (Phase 0 of design/renderer-e2e-strategy.md).
 *
 * These specs assert on SEMANTIC output — ARIA roles, accessible names, visible text, the page
 * title — NOT on a design system's tags (`vaadin-*`, `oj-*`, …). One spec therefore expresses one
 * behaviour that ANY renderer must satisfy, so the same file can be pointed at Vaadin, VB/Redwood,
 * React Native (expo-web) or any web renderer by changing only the project's baseURL.
 *
 * The surfaces covered are the ones a GA claim rests on: a page renders with its title, routing
 * (incl. SPA sub-routes) resolves, the app menu is navigable, form fields render (incl. a checkbox
 * for a boolean), and a listing shows rows. Backed by the sample1 SUT.
 */

test.describe('renderer-agnostic smoke', () => {
  test('a page renders with its title and its content', async ({ page }) => {
    await page.goto('/field-types');
    await expect(page).toHaveTitle(/Field Types Form/);
    // Its content is actually painted (a form field for the String field shows up).
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 15000 });
  });

  test('routing resolves, including SPA sub-routes', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveTitle(/Menu App/);
    // A sub-route under the mount is served by the same app shell, not a 404.
    await page.goto('/app/section1');
    await expect(page.locator('mateu-ui')).toBeAttached();
  });

  test('the app menu renders navigable entries', async ({ page }) => {
    await page.goto('/app');
    await expect(page.getByRole('main')).toBeVisible();
    // The menu items are links/menuitems with accessible names — at least one is present.
    const entries = page.getByRole('link').or(page.getByRole('menuitem'));
    await expect(entries.first()).toBeVisible({ timeout: 15000 });
  });

  test('form fields render, including a checkbox for a boolean', async ({ page }) => {
    await page.goto('/field-types');
    // A text input for the String field…
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 15000 });
    // …and a checkbox for the boolean field (this is exactly the bool/boolean matrix hole the
    // conformance corpus surfaced — a boolean must render as a checkbox on every renderer).
    await expect(page.getByRole('checkbox').first()).toBeVisible();
  });

  test('a listing shows its rows', async ({ page }) => {
    await page.goto('/simple-listing');
    // A grid/table with rows, whatever DOM the renderer uses for it (Vaadin exposes role=treegrid).
    const grid = page
      .getByRole('grid')
      .or(page.getByRole('treegrid'))
      .or(page.getByRole('table'));
    await expect(grid.first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('row').first()).toBeVisible();
  });
});
