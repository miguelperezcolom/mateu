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

test.describe('@ConfirmOnNavigationIfDirty — CRUD save resets the guard', () => {

  // Regression: in a CRUD create form the user types values (dirty), then clicks Save.
  // The backend must return a MarkAsClean command so the guard is reset; otherwise
  // navigating away after a successful save keeps prompting for unsaved changes.
  // Mirror the guard: 'dirty' arms it, 'clean' disarms it.
  async function trackGuardFlag(page: any) {
    await page.evaluate(() => {
      (window as any).__dirty = false;
      document.addEventListener('dirty', () => { (window as any).__dirty = true; });
      document.addEventListener('clean', () => { (window as any).__dirty = false; });
    });
  }

  test('editing then saving a new entity fires "clean" (guard reset)', async ({ page }) => {
    await page.goto('/full-crud/new');
    await expect(fieldInput(page, 'title')).toBeVisible();
    await trackGuardFlag(page);

    const input = fieldInput(page, 'title');
    await input.fill('Brand new task');
    await input.blur();
    // Typing arms the guard.
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(true);

    // Click Save. The CRUD persists and returns a MarkAsClean command, which
    // ConnectedElement turns into a document-level 'clean' event the guard listens for.
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // The guard must end up clean, so a later navigation would NOT prompt.
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(false);
  });

  test('navigating away after a save does NOT prompt', async ({ page }) => {
    let dialogShown = false;
    page.on('dialog', async (d) => { dialogShown = true; await d.dismiss(); });

    await page.goto('/full-crud/new');
    await expect(fieldInput(page, 'title')).toBeVisible();

    const input = fieldInput(page, 'title');
    await input.fill('Another task');
    await input.blur();
    await page.waitForTimeout(150);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // Give the MarkAsClean command time to reset the guard.
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      history.pushState({}, '', location.pathname + '?nav=1');
      history.back();
    });
    await page.waitForTimeout(300);
    expect(dialogShown).toBe(false);
  });

});

test.describe('@ConfirmOnNavigationIfDirty — embedded EditableView resets guard on save/cancel', () => {

  // Regression: an embedded EditableView (rendered via @Inline inside a host page) enters edit
  // mode → arms the dirty guard when the user types → must disarm the guard when the user clicks
  // Save or Cancel and the inner view re-renders in (untracked) view mode. Without this, the host
  // page would prompt "unsaved changes" on every navigation, even right after a successful save.
  //
  // The fix lives in mateu-component.updated(): the `clean` event is dispatched on component
  // change whenever EITHER the previous or new component is tracked — so the edit→view transition
  // (tracked→untracked) does fire `clean`.
  async function trackGuardFlag(page: any) {
    await page.evaluate(() => {
      (window as any).__dirty = false;
      document.addEventListener('dirty', () => { (window as any).__dirty = true; });
      document.addEventListener('clean', () => { (window as any).__dirty = false; });
    });
  }

  async function enterEditMode(page: any) {
    // The embedded mediator initially renders read-only. Click the Edit button it brings.
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(fieldInput(page, 'firstName')).toBeVisible();
  }

  // EmbeddedDataView keeps its data in a static field, so the store value carries across tests.
  // We use Date.now() to guarantee a value different from whatever is currently saved — otherwise
  // fill() with the same value as the current input doesn't fire a value-changed event and the
  // dirty guard never arms.
  test('save inside the embedded EditableView fires "clean"', async ({ page }) => {
    await page.goto('/inline-host');
    await trackGuardFlag(page);
    await enterEditMode(page);

    const uniqueValue = `Lucía-${Date.now()}`;
    await fieldInput(page, 'firstName').fill(uniqueValue);
    await fieldInput(page, 'firstName').blur();
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(true);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    // Edit → view transition; the guard must end up clean so a later navigation does NOT prompt.
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(false);
  });

  test('cancel inside the embedded EditableView fires "clean"', async ({ page }) => {
    await page.goto('/inline-host');
    await trackGuardFlag(page);
    await enterEditMode(page);

    const uniqueValue = `Discarded-${Date.now()}`;
    await fieldInput(page, 'firstName').fill(uniqueValue);
    await fieldInput(page, 'firstName').blur();
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(true);

    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__dirty)).toBe(false);
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
