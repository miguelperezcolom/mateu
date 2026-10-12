import { test, expect } from '@playwright/test';

/**
 * Renderer-agnostic forms walkthrough (design/walkthrough/forms.md): semantic assertions only —
 * accessible names, roles and visible text — so the same spec runs on Vaadin and on VB/Redwood.
 */

test.describe('renderer-agnostic forms', () => {
  test('every basic type is drawn and the form action round-trips the values', async ({ page }) => {
    await page.goto('/walk-fields');
    // a LocalTime was not drawn at all on Redwood, an Amount was blank
    await expect(page.getByText('Time', { exact: true }).first()).toBeVisible({ timeout: 15000 });
    // a form with a grid field lost its action row on Redwood (the rich blocks replaced the form)
    const echo = page.getByRole('button', { name: 'Echo' });
    await expect(echo).toBeVisible();
    await echo.click();
    await expect(page.getByText(/echo: text=hello/).first()).toBeVisible();
    await expect(page.getByText(/time=10:30 when=2026-01-15T10:30/).first()).toBeVisible();
    await expect(page.getByText(/total=EUR\/25\.5/).first()).toBeVisible();
  });

  test('a form with an editable grid keeps its action button', async ({ page }) => {
    await page.goto('/inline-grid-form');
    await expect(page.getByRole('button', { name: 'Recalc' })).toBeVisible({ timeout: 15000 });
  });

  test('a required field refuses the action', async ({ page }) => {
    await page.goto('/validation');
    const validate = page.getByRole('button', { name: 'Validate' });
    await expect(validate).toBeVisible({ timeout: 15000 });
    await validate.click();
    await expect(page.getByText(/Cannot be empty|Required/i).first()).toBeVisible();
    await expect(page.getByText('Valid!')).toHaveCount(0);
  });

  test('a wizard walks its steps and its result reads every one of them', async ({ page }) => {
    await page.goto('/walk-wizard');
    // VB/Redwood opens a guided process on an intro page
    const start = page.getByRole('button', { name: 'Start' });
    // the forward button: Next (Vaadin) or the guided process's Continue (Redwood) — only one of
    // them (a Draftable's row used to show Next next to Continue, which saved the draft)
    const forward = page.getByRole('button', { name: /^(Next|Continue)$/ });
    await expect(start.or(forward).first()).toBeVisible({ timeout: 15000 });
    if (await start.isVisible()) await start.click();
    await expect(forward).toHaveCount(1, { timeout: 15000 });
    await page.getByRole('textbox', { name: 'Name' }).first().fill('Ana');
    await forward.click();
    await expect(page.getByRole('textbox', { name: 'Nights' }).or(page.getByRole('spinbutton', { name: 'Nights' })).first()).toBeVisible();
    await forward.click();
    await page.getByRole('textbox', { name: 'Notes' }).first().fill('late');
    await expect(page.getByRole('button', { name: 'Check in' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Check in' }).click();
    await expect(page.getByText('Checked in Ana, 1 nights, notes: late').first()).toBeVisible();
  });

  test('a sectioned form with tabs in one section shows every section, the open tab and its buttons', async ({ page }) => {
    // on Redwood a card + a tab bar anywhere was taken for an item overview: only the first
    // section and the tab bar were drawn
    await page.goto('/walk-layout');
    await expect(page.getByText('X1234567').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('3 previous stays').or(page.getByRole('textbox', { name: 'History' })).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Diet' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: 'Echo' })).toBeVisible();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('add address').first()).toBeVisible();
  });

  test('a YAML form with no view model renders its definition', async ({ page }) => {
    await page.goto('/walk-yaml');
    await expect(page.getByText('YAML booking').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Nights', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Look up' })).toBeVisible();
  });
});
