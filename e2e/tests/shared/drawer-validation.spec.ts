import { test, expect, Page } from '@playwright/test';

/**
 * The create/edit DRAWER validates like the routed form. Fixture: mvc-app1 `DrawerValidationCrud`
 * (/drawer-validation) — `@NotEmpty name`, `@Email email`.
 *
 * Before the fix the drawer's form was plain content of the crud component, whose create/save are
 * not validated in the browser: an empty required field was sent, the server refused it, and the
 * field was never marked invalid.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mvc-app1', 'the drawer-validation fixture lives in mvc-app1');
});

const drawer = (page: Page) => page.getByRole('dialog', { name: /New|Edit/ });
const input = (page: Page, fieldId: string) => drawer(page).locator(`#${fieldId} input`).first();
const invalid = (page: Page, fieldId: string) =>
  drawer(page).locator(`#${fieldId} [invalid]`).first();

test('a required field left empty is blocked in the browser and marked', async ({ page }) => {
  await page.goto('/drawer-validation');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await expect(input(page, 'name')).toBeVisible();

  const sent: string[] = [];
  page.on('request', r => { if (r.method() === 'POST' && (r.postData() ?? '').includes('"actionId":"create"')) sent.push(r.url()) });
  await drawer(page).getByRole('button', { name: 'Save', exact: true }).click();

  await expect(invalid(page, 'name')).toBeVisible();
  await expect(drawer(page)).toBeVisible();
  expect(sent, 'the browser does not send an invalid form').toHaveLength(0);

  // fixing it lets the save through
  await input(page, 'name').fill(`Grace ${Date.now()}`);
  await input(page, 'name').blur();
  await drawer(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(drawer(page)).toHaveCount(0);
});

test('a constraint only the server checks marks its field when the save is refused', async ({ page }) => {
  await page.goto('/drawer-validation');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await input(page, 'name').fill(`Linus ${Date.now()}`);
  await input(page, 'email').fill('not-an-email');
  await input(page, 'email').blur();
  await drawer(page).getByRole('button', { name: 'Save', exact: true }).click();

  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page)).toContainText('Email:');
  await expect(invalid(page, 'email')).toBeVisible();
  // what was typed is still there
  await expect(input(page, 'email')).toHaveValue('not-an-email');
});
