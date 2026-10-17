import { test, expect, Browser, Page } from '@playwright/test';

/**
 * Optimistic locking (@Version) with two people editing the same record, routed editor AND
 * create/edit drawer. Fixtures: mvc-app1 `LockedArticles` (/locked-articles) and
 * `LockedArticlesInDrawer` (/locked-articles-drawer).
 *
 * Before the fix, both conflict-dialog buttons sent the CRUD page's state instead of the edit
 * form's: on the routed editor Overwrite said "Item saved successfully", navigated to
 * /locked-articles/null, lost the change and left the dialog open; in the drawer Overwrite created a
 * duplicate row. The texts were hard-coded Spanish.
 */

test.describe.configure({ mode: 'serial' });

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mvc-app1', 'the locked-article fixtures live in mvc-app1');
});

const nameInput = (page: Page) => page.locator('#name input').first();

async function user(browser: Browser, url: string): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  return page;
}

async function rename(page: Page, value: string) {
  await expect(nameInput(page)).toBeVisible();
  await nameInput(page).fill(value);
  await nameInput(page).blur();
}

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Modified by another user' });
const drawer = (page: Page) => page.getByRole('dialog', { name: 'Edit' });

test.describe('optimistic locking — routed editor', () => {
  test('Overwrite saves MY version over theirs and closes the dialog', async ({ browser }) => {
    const stamp = Date.now();
    const a = await user(browser, '/locked-articles/a1/edit');
    const b = await user(browser, '/locked-articles/a1/edit');
    await rename(a, `Theirs ${stamp}`);
    await rename(b, `Mine ${stamp}`);
    await a.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(a).toHaveURL(/\/locked-articles\/a1$/);

    await b.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog(b)).toBeVisible();
    await expect(dialog(b)).toContainText('This record changed while you were editing it');
    await dialog(b).getByRole('button', { name: 'Overwrite' }).click();

    await expect(dialog(b)).toHaveCount(0);
    await expect(b).toHaveURL(/\/locked-articles\/a1$/);
    await expect(b.locator('body')).not.toContainText('null');
    // the stored record is mine: a third look sees it
    const c = await user(browser, '/locked-articles/a1/edit');
    await expect(nameInput(c)).toHaveValue(`Mine ${stamp}`);
  });

  test('Reload discards my change and shows theirs', async ({ browser }) => {
    const stamp = Date.now();
    const a = await user(browser, '/locked-articles/a2/edit');
    const b = await user(browser, '/locked-articles/a2/edit');
    await rename(a, `Theirs ${stamp}`);
    await rename(b, `Mine ${stamp}`);
    await a.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(a).toHaveURL(/\/locked-articles\/a2$/);

    await b.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog(b)).toBeVisible();
    await dialog(b).getByRole('button', { name: 'Reload' }).click();

    await expect(dialog(b)).toHaveCount(0);
    await expect(b).toHaveURL(/\/locked-articles\/a2/);
    await expect(b.locator('body')).toContainText(`Theirs ${stamp}`);
    const c = await user(browser, '/locked-articles/a2/edit');
    await expect(nameInput(c)).toHaveValue(`Theirs ${stamp}`);
  });
});

test.describe('optimistic locking — edit drawer', () => {
  async function openDrawer(browser: Browser, rowText: string): Promise<Page> {
    const page = await user(browser, '/locked-articles-drawer');
    await page.getByText(rowText, { exact: true }).first().click();
    await expect(drawer(page)).toBeVisible();
    return page;
  }

  async function rows(page: Page) {
    return page.locator('vaadin-grid-cell-content').allInnerTexts();
  }

  test('Overwrite saves MY version over theirs without adding a row', async ({ browser }) => {
    const stamp = Date.now();
    const seed = await user(browser, '/locked-articles-drawer/d1/edit');
    await rename(seed, `Start ${stamp}`);
    await seed.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(drawer(seed)).toHaveCount(0);

    const a = await openDrawer(browser, `Start ${stamp}`);
    const b = await openDrawer(browser, `Start ${stamp}`);
    await rename(a, `Theirs ${stamp}`);
    await rename(b, `Mine ${stamp}`);
    await a.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(drawer(a)).toHaveCount(0);

    await b.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog(b)).toBeVisible();
    await dialog(b).getByRole('button', { name: 'Overwrite' }).click();

    await expect(dialog(b)).toHaveCount(0);
    await expect(drawer(b)).toHaveCount(0);
    await expect(b.getByText(`Mine ${stamp}`, { exact: true })).toBeVisible();
    const fresh = await user(browser, '/locked-articles-drawer');
    await expect(fresh.getByText(`Mine ${stamp}`, { exact: true })).toHaveCount(1);
    await expect(fresh.getByText(`Theirs ${stamp}`, { exact: true })).toHaveCount(0);
    expect((await rows(fresh)).filter(t => t.includes(`${stamp}`))).toHaveLength(1);
  });

  test('Reload shows their version in the drawer', async ({ browser }) => {
    const stamp = Date.now();
    const seed = await user(browser, '/locked-articles-drawer/d2/edit');
    await rename(seed, `Start ${stamp}`);
    await seed.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(drawer(seed)).toHaveCount(0);

    const a = await openDrawer(browser, `Start ${stamp}`);
    const b = await openDrawer(browser, `Start ${stamp}`);
    await rename(a, `Theirs ${stamp}`);
    await rename(b, `Mine ${stamp}`);
    await a.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(drawer(a)).toHaveCount(0);

    await b.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog(b)).toBeVisible();
    await dialog(b).getByRole('button', { name: 'Reload' }).click();

    await expect(dialog(b)).toHaveCount(0);
    await expect(drawer(b)).toBeVisible();
    await expect(nameInput(b)).toHaveValue(`Theirs ${stamp}`);
  });
});
