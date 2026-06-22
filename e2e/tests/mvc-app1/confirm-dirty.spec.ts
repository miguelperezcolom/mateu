import { test, expect } from '@playwright/test';

/**
 * UI coverage for @ConfirmOnNavigationIfDirty.
 *
 * The dirty-state guard is fed by `dirty` / `clean` DOM events that bubble (composed) up to
 * `document` from mateu-component when a tracked form's field actually changes. These tests
 * assert that wiring end-to-end in the browser:
 *   - editing a field on an annotated form fires `dirty`;
 *   - a non-annotated form never fires `dirty`;
 *   - the native "leave?" confirm is armed (beforeunload) while dirty.
 */

// Capture dirty/clean events at document level into window flags.
async function trackDirtyEvents(page: any) {
  await page.evaluate(() => {
    (window as any).__dirty = false;
    (window as any).__clean = false;
    document.addEventListener('dirty', () => { (window as any).__dirty = true; });
    document.addEventListener('clean', () => { (window as any).__clean = true; });
  });
}

// First editable text input inside the field with the given fieldId (pierces shadow DOM).
function fieldInput(page: any, fieldId: string) {
  return page.locator(`#${fieldId} input`).first();
}

test.describe('@ConfirmOnNavigationIfDirty — dirty tracking', () => {

  test('the page renders the annotated form', async ({ page }) => {
    await page.goto('/confirm-dirty');
    await expect(page).toHaveTitle(/Confirm Dirty Form/);
    await expect(fieldInput(page, 'name')).toBeVisible();
  });

  test('editing a field fires a "dirty" event', async ({ page }) => {
    await page.goto('/confirm-dirty');
    await expect(fieldInput(page, 'name')).toBeVisible();
    await trackDirtyEvents(page);

    const input = fieldInput(page, 'name');
    await input.fill('Changed name');
    await input.blur();

    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(true);
  });

  test('navigating back while dirty shows the confirm prompt', async ({ page }) => {
    let dialogMessage = '';
    page.on('dialog', async (d) => { dialogMessage = d.message(); await d.dismiss(); });

    await page.goto('/confirm-dirty');
    await expect(fieldInput(page, 'name')).toBeVisible();

    const input = fieldInput(page, 'name');
    await input.fill('Another value');
    await input.blur();
    // Let the dirty event reach the guard.
    await page.waitForTimeout(150);

    // Push a history entry, then go back. The guard intercepts the popstate and asks the
    // user to confirm leaving (window.confirm) because the form has unsaved changes.
    await page.evaluate(() => {
      history.pushState({}, '', location.pathname + '?nav=1');
      history.back();
    });

    await expect.poll(() => dialogMessage).toContain('unsaved changes');
  });

  test('navigating back when clean does NOT prompt', async ({ page }) => {
    let dialogShown = false;
    page.on('dialog', async (d) => { dialogShown = true; await d.dismiss(); });

    await page.goto('/confirm-dirty');
    await expect(fieldInput(page, 'name')).toBeVisible();
    // No edits → form stays clean.
    await page.evaluate(() => {
      history.pushState({}, '', location.pathname + '?nav=1');
      history.back();
    });
    await page.waitForTimeout(300);
    expect(dialogShown).toBe(false);
  });

});

test.describe('@ConfirmOnNavigationIfDirty — opt-in', () => {

  test('a non-annotated form (root SimpleForm) never fires "dirty"', async ({ page }) => {
    await page.goto('/');
    await expect(fieldInput(page, 'name')).toBeVisible();
    await trackDirtyEvents(page);

    const input = fieldInput(page, 'name');
    await input.fill('typing here');
    await input.blur();

    // Wait for any state propagation, then confirm no dirty event was emitted.
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__dirty)).toBe(false);
  });

});
