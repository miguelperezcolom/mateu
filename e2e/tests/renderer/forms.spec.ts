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

  test('a YAML form with no view model renders its definition', async ({ page }) => {
    await page.goto('/walk-yaml');
    await expect(page.getByText('YAML booking').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Nights', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Look up' })).toBeVisible();
  });
});
