import { test, expect, Page } from '@playwright/test';

/**
 * The create/edit DRAWER validates like the routed form. Fixture: mvc-app1 `DrawerValidationCrud`
 * (/drawer-validation) — `@NotEmpty name`, `@Email email` (both validated in the browser).
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

// @Email used to be checked by the server only (the save was sent, refused, and the refusal marked
// the field). Since @Email maps to a client validation (ConstraintValidationMapper), the drawer
// blocks it in the browser like the required field, with the validator's own message.
test('an @Email the browser rejects is marked in the drawer and not sent', async ({ page }) => {
  await page.goto('/drawer-validation');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await input(page, 'name').fill(`Linus ${Date.now()}`);
  await input(page, 'email').fill('not-an-email');
  await input(page, 'email').blur();

  const sent: string[] = [];
  page.on('request', r => { if (r.method() === 'POST' && (r.postData() ?? '').includes('"actionId":"create"')) sent.push(r.url()) });
  await drawer(page).getByRole('button', { name: 'Save', exact: true }).click();

  await expect(drawer(page)).toBeVisible();
  await expect(invalid(page, 'email')).toBeVisible();
  await expect(drawer(page)).toContainText('must be a well-formed email address');
  // what was typed is still there
  await expect(input(page, 'email')).toHaveValue('not-an-email');
  expect(sent, 'the browser does not send an invalid form').toHaveLength(0);
});

// Closing the drawer by hand (✕, Esc, Cancel) with unsaved edits asks first — the same question
// the Redwood create-edit drawer asks ("Discard your changes?"); "stay" keeps the drawer and what
// was typed, "discard" closes it. A successful save closes it without asking.
test('closing the drawer with unsaved edits asks first; a save closes it without asking', async ({ page }) => {
  await page.goto('/drawer-validation');
  await page.getByRole('button', { name: 'New', exact: true }).click();

  // nothing typed: ✕ just closes
  const asked: string[] = [];
  let answer: 'accept' | 'dismiss' = 'dismiss';
  page.on('dialog', d => { asked.push(d.message()); void (answer === 'accept' ? d.accept() : d.dismiss()) });
  await drawer(page).getByRole('button', { name: /Close|Cerrar/ }).click();
  await expect(drawer(page)).toHaveCount(0);
  expect(asked).toHaveLength(0);

  await page.getByRole('button', { name: 'New', exact: true }).click();
  const name = `Ada ${Date.now()}`;
  await input(page, 'name').fill(name);
  await input(page, 'name').blur();

  await drawer(page).getByRole('button', { name: /Close|Cerrar/ }).click();
  await page.keyboard.press('Escape');
  await drawer(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect.poll(() => asked.length).toBe(3);
  expect(asked[0]).toMatch(/Discard your changes|Descartar los cambios/);
  await expect(drawer(page)).toBeVisible();
  await expect(input(page, 'name')).toHaveValue(name);

  answer = 'accept';
  await drawer(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(drawer(page)).toHaveCount(0);

  // a save closes without asking
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await input(page, 'name').fill(name);
  await input(page, 'name').blur();
  const before = asked.length;
  await drawer(page).getByRole('button', { name: 'Save', exact: true }).click();
  await expect(drawer(page)).toHaveCount(0);
  expect(asked).toHaveLength(before);
});
