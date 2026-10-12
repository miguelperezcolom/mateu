import { test, expect, Page } from '@playwright/test';

// The app-shell walkthrough (design/walkthrough/app-shell.md), menu half: ShellApp (@UI("/shell"),
// MENU_ON_TOP) declares every kind of menu entry — a page, a group holding a nested group, a
// RouteLink to a route with pinned params, a card group, an @EyesOnly entry and a rule leaf — and
// shell-routes.yaml binds orders (fixed vs default params) and a record master whose tabs are
// child routes. Each test clicks/deep-links/reloads like a user and fails on console errors.

function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    const text = m.text();
    if (m.type() === 'error' || /no component on the page handles it/.test(text)) {
      problems.push(`[${m.type()}] ${text}`);
    }
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  return problems;
}

const menuItem = (page: Page, name: string) =>
  page.getByRole('navigation').getByRole('menuitem', { name, exact: true });

test.describe('Shell menu (/shell)', () => {

  test('a page entry navigates, deep-links and survives a reload', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell');
    await menuItem(page, 'Probe').click();
    await expect(page).toHaveURL(/\/shell\/probe$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    await page.goto('/shell/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('back and forward move between menu destinations', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await menuItem(page, 'Page').click();
    await expect(page).toHaveURL(/\/shell\/page$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/shell\/probe$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/shell\/page$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });

  test('a group opens and its nested group reaches its page', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell');
    await menuItem(page, 'Reports').click();
    await page.getByRole('menuitem', { name: 'Monthly', exact: true }).click();
    await expect(page).toHaveURL(/\/shell\/reports\/monthly$/);
    await expect(page.getByLabel('Description')).toBeVisible();

    await menuItem(page, 'Reports').click();
    await page.getByRole('menuitem', { name: /^Archive/ }).click();
    await page.getByRole('menuitem', { name: 'Yearly', exact: true }).click();
    await expect(page).toHaveURL(/\/shell\/reports\/archive\/yearly$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('an @EyesOnly entry is not offered to an anonymous visitor', async ({ page }) => {
    await page.goto('/shell');
    await expect(menuItem(page, 'Probe')).toBeVisible();
    await expect(page.getByText('Secret', { exact: true })).toHaveCount(0);
  });

  test('a rule leaf runs its action instead of navigating', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();
    await menuItem(page, 'Ping').click();
    await expect(page.getByText('pong').first()).toBeVisible();
    await expect(page).toHaveURL(/\/shell\/probe$/);
    expect(problems).toEqual([]);
  });

  test('a card group opens as cards whose card and card actions navigate', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell');
    await page.getByRole('navigation').getByRole('button', { name: 'Quick' }).click();
    await expect(page.getByText('Echo the app context')).toBeVisible();
    await page.getByText('Check in', { exact: true }).click();
    await expect(page).toHaveURL(/\/shell\/quick\/checkIn$/);
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible();

    await page.getByRole('navigation').getByRole('button', { name: 'Quick' }).click();
    await page.getByText('Folio', { exact: true }).click();
    await expect(page).toHaveURL(/\/shell\/quick\/billing\/folio$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    expect(problems).toEqual([]);
  });
});

test.describe('Shell routes from routes.yaml (/shell)', () => {

  test('a RouteLink to a route with a pinned param lands with the param set', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell');
    await menuItem(page, 'Pending orders').click();
    await expect(page).toHaveURL(/\/shell\/orders\/pending$/);
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=pending').first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('a pinned param survives a reload (a load by type)', async ({ page }) => {
    // orders/pending and orders share a view model: reloaded, the page used to take the defaults
    // of the shorter route (status=open)
    await page.goto('/shell/orders/pending');
    await expect(page.getByRole('button', { name: 'Show status' })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=pending').first()).toBeVisible();
  });

  test('a pinned param is not overridable by the query', async ({ page }) => {
    await page.goto('/shell/orders/pending?status=open');
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=pending').first()).toBeVisible();
  });

  test('a default param seeds the route and the query overrides it', async ({ page }) => {
    await page.goto('/shell/orders');
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=open').first()).toBeVisible();

    await page.goto('/shell/orders?status=closed');
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=closed').first()).toBeVisible();
  });

  test('a record master opens its default child tab with the path param', async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto('/shell/customers/7');
    await expect(page.getByText('Customer 7').first()).toBeVisible();
    await page.getByRole('button', { name: 'Which customer' }).click();
    await expect(page.getByText('orders of 7').first()).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('a deep link to a child tab lands inside the master and survives a reload', async ({ page }) => {
    await page.goto('/shell/customers/7/notes');
    await expect(page.getByText('Customer 7').first()).toBeVisible();
    await page.getByRole('button', { name: 'Which customer notes' }).click();
    await expect(page.getByText('notes of 7').first()).toBeVisible();

    await page.reload();
    await expect(page.getByText('Customer 7').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Which customer notes' })).toBeVisible();
  });
});
