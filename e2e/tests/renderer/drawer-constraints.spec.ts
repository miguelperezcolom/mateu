import { test, expect, type Page } from '@playwright/test';

/**
 * The create/edit DRAWER of a crud checks every constraint the browser can — a required field, a
 * bound, a pattern — before Save leaves, like the routed form: nothing is sent while one fails and
 * the field says why (fixture DrawerConstraintsCrud). On Redwood the drawer's Save went to the
 * server unchecked and only the server refused it. Semantic assertions only, so it runs on Vaadin
 * and on VB/Redwood.
 */

const field = (page: Page, name: string) =>
  page.getByRole('textbox', { name }).or(page.getByRole('spinbutton', { name })).last();

test('the create drawer refuses an empty required field, a bound and a pattern in the browser', async ({ page }) => {
  const creates: string[] = [];
  page.on('request', (request) => {
    if (!request.url().includes('/mateu/v3/')) return;
    try {
      if (request.postDataJSON()?.actionId === 'create') creates.push(request.url());
    } catch {
      // not a JSON body
    }
  });
  await page.goto('/drawer-constraints');
  const create = page.getByRole('button', { name: 'New' }).first();
  await expect(create).toBeVisible({ timeout: 15000 });
  await create.click();
  const save = page.getByRole('button', { name: 'Save' }).last();
  await expect(save).toBeVisible();

  // the required name left empty
  await save.click();
  await expect(page.getByText(/Cannot be empty|Enter a value/).first()).toBeVisible();
  expect(creates).toHaveLength(0);

  // a bound and a pattern, with the constraint's own message
  const name = `Room ${Date.now()}`;
  await field(page, 'Name').fill(name);
  await field(page, 'Beds').fill('12');
  await field(page, 'Code').fill('ab');
  await field(page, 'Code').press('Tab');
  await save.click();
  await expect(page.getByText('Must be at most 9').first()).toBeVisible();
  await expect(page.getByText('Invalid format').first()).toBeVisible();
  expect(creates).toHaveLength(0);

  // all valid: it is saved and the listing shows it
  await field(page, 'Beds').fill('3');
  await field(page, 'Code').fill('GAR');
  await field(page, 'Code').press('Tab');
  await save.click();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 15000 });
  expect(creates).toHaveLength(1);
});
