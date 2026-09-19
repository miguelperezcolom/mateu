import { test, expect } from '@playwright/test';

/**
 * R2 — App ≠ its Home Screen (coherence-plan #5). A multi-screen app whose home is a DISTINCT route
 * mounts that route's Screen in its content slot; the App renders only the chrome. This verifies the
 * conflation removal end to end: the app's home fragment is typed with the home SCREEN's class, so
 * the home Screen's content loads (not the app re-rendering itself).
 */
test.describe('App ≠ its Home Screen (R2)', () => {

  test('a multi-screen app mounts its distinct home Screen in the content slot', async ({ page }) => {
    await page.goto('/r2home');
    // The app chrome renders (title), AND the distinct home Screen's content is mounted — the
    // R2HomeScreen field value, not the app itself. Use the heading role for the Screen title (a
    // bare text match also hits the a11y live-region that announces the page title) and the unique
    // field value for the content.
    await expect(page.getByRole('heading', { name: 'R2 home screen' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('R2 home content')).toBeVisible();
  });
});
