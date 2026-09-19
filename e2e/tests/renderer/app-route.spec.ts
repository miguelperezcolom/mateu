import { test, expect } from '@playwright/test';

/**
 * @App(route = "/x") declares an app AND its route in ONE annotation (coherence-plan #5) — no
 * separate @UI. This verifies a real compiled @App(route)-only app is served: the framework
 * annotation processor generated its controller, and route resolution renders it as an app.
 */
test.describe('@App(route) — the single app annotation (Phase 5)', () => {

  test('an app declared with only @App(route) is served and renders as an app', async ({ page }) => {
    await page.goto('/appdemo');
    // It resolved as an APP: the framework AP generated its controller, the SPA is served at
    // /appdemo, and the app mounts its distinct home Screen (/r2home/screen) in the content slot.
    // The app's own @Title goes to the window title, not the body — so assert the home Screen's
    // content instead (heading + the note field's value), exactly like the R2 (app≠home) spec.
    await expect(page.getByRole('heading', { name: 'R2 home screen' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('textbox').first()).toHaveValue('R2 home content');
  });
});
