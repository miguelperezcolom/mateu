import { test, expect } from '@playwright/test';

/**
 * @App(route = "/x") declares an app AND its route in ONE annotation (coherence-plan #5) — no
 * separate @UI. This verifies a real compiled @App(route)-only app is served: the framework
 * annotation processor generated its controller, and route resolution renders it as an app.
 */
test.describe('@App(route) — the single app annotation (Phase 5)', () => {

  test('an app declared with only @App(route) is served and renders as an app', async ({ page }) => {
    await page.goto('/appdemo');
    // The app chrome renders (its @Title), and its menu item is present — it resolved as an APP.
    await expect(page.getByText('App via @App route').first()).toBeVisible({ timeout: 15000 });
  });
});
