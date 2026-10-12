import { test, expect } from '@playwright/test';

// The YAML forms walkthrough (design/walkthrough/forms.md): /walk-yaml is a route authored in
// sample1-routes.yaml with a definition (walk-yaml-form.yaml) and NO view model, under the root
// mount whose class is a plain @UI("") form.

test.describe('a YAML form with no view model (/walk-yaml)', () => {

  test('a fresh load renders the definition, not the mount root class', async ({ page }) => {
    // the root mount's class answered every fresh deep link under it, so the page showed
    // "Simple Form" instead of the YAML form
    await page.goto('/walk-yaml');
    await expect(page.getByRole('heading', { name: 'YAML booking' })).toBeVisible();
    await expect(page.locator('mateu-field#nights vaadin-integer-field')).toBeVisible();
    await expect(page.locator('mateu-field#arrival vaadin-date-picker')).toBeVisible();
    await expect(page.locator('mateu-field#vip vaadin-checkbox')).toBeVisible();
    await expect(page.locator('mateu-field#notes vaadin-text-area')).toBeVisible();
  });

  test('a field type gives the field its label, stereotype, placeholder and required flag', async ({ page }) => {
    await page.goto('/walk-yaml');
    const email = page.locator('mateu-field#email vaadin-email-field');
    await expect(email).toHaveAttribute('label', 'E-mail');
    // the placeholder was never rendered by the Vaadin fields
    await expect(email.locator('input')).toHaveAttribute('placeholder', 'name@example.com');
    await expect(email).toHaveJSProperty('required', true);
  });

  test('a declared action is validated before it runs', async ({ page }) => {
    await page.goto('/walk-yaml');
    await page.getByRole('button', { name: 'Look up' }).click();
    await expect(page.locator('vaadin-notification-card').filter({ hasText: 'Guest: Cannot be empty' })).toBeVisible();
  });

  test('a valid form runs its REST action and merges the result', async ({ page }, testInfo) => {
    // the static JSON the action reads is only served by the MVC SUT app
    test.skip(!['mvc-app1', 'shared'].includes(testInfo.project.name), 'rest-action-demo.json is served by mvc-app1');
    await page.goto('/walk-yaml');
    await page.locator('mateu-field#guest input').fill('Ana');
    await page.locator('mateu-field#email input').fill('ana@example.com');
    await page.getByRole('button', { name: 'Look up' }).click();
    await expect(page.locator('vaadin-notification-card').filter({ hasText: 'Address found' })).toBeVisible();
    await expect(page.locator('mateu-field#street input')).toHaveValue('Gran Vía 1');
  });
});
