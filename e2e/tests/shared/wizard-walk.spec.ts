import { test, expect, Page } from '@playwright/test';

// The wizard walkthrough (design/walkthrough/forms.md), driven in the browser on /walk-wizard
// (WalkWizard, identical in every SUT app): validation per step, a navigation guard, a branch that
// only applies to companies, Back, a draft, the RAIL progress, and a completion whose result reads
// what every earlier step collected.

const fields = (page: Page) => page.locator('mateu-field').evaluateAll((fs) => fs.map((f) => f.id));
const toast = (page: Page, text: string | RegExp) =>
  page.locator('vaadin-notification-card').filter({ hasText: text }).last();
const next = (page: Page) => page.getByRole('button', { name: 'Next' }).click();

test.describe('WalkWizard (/walk-wizard)', () => {

  test('a refused step can be fixed and submitted with a single click on Next', async ({ page }) => {
    // The error message stayed until the field lost focus, so the click on Next blurred the field,
    // the message vanished, the button jumped up under the pointer and the click landed on nothing.
    await page.goto('/walk-wizard');
    await next(page);
    await expect(toast(page, 'Name: Cannot be empty')).toBeVisible();
    await page.locator('mateu-field#name input').fill('Ana');
    await next(page);
    await expect.poll(() => fields(page)).toEqual(['nights']);
  });

  test('the navigation guard refuses with its own message and keeps the step', async ({ page }) => {
    await page.goto('/walk-wizard');
    await page.locator('mateu-field#name input').fill('blocked');
    await next(page);
    await expect(toast(page, 'That guest cannot check in')).toBeVisible();
    expect(await fields(page)).toEqual(['name', 'kind']);
  });

  test('the company step only applies to companies, Back keeps what was typed, and the result reads every step', async ({ page }) => {
    await page.goto('/walk-wizard');
    await page.locator('mateu-field#name input').fill('Ana');
    await next(page);
    // an individual skips the company step
    await expect.poll(() => fields(page)).toEqual(['nights']);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.locator('mateu-field#name input')).toHaveValue('Ana');

    await page.locator('mateu-field#kind vaadin-select').click();
    await page.getByRole('option', { name: 'Company' }).click();
    await next(page);
    await expect.poll(() => fields(page)).toEqual(['companyName']);
    await expect(page.locator('mateu-progress-steps')).toContainText('Company');
    await page.locator('mateu-field#companyName input').fill('Acme');
    await next(page);

    await expect.poll(() => fields(page)).toEqual(['nights']);
    await page.locator('mateu-field#nights input').fill('0');
    await next(page);
    await expect(toast(page, 'Nights: Must be at least 1')).toBeVisible();
    await page.locator('mateu-field#nights input').fill('3');
    await next(page);

    await expect.poll(() => fields(page)).toEqual(['notes']);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(toast(page, 'Draft saved for Ana')).toBeVisible();
    await page.locator('mateu-field#notes input').fill('late arrival');
    await page.getByRole('button', { name: 'Check in' }).click();

    await expect(page.getByText('Checked in Ana for Acme, 3 nights, notes: late arrival')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);
  });
});
