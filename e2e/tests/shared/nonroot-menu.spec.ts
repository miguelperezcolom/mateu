import { test, expect, Page } from '@playwright/test';

// A NON-ROOT app (@UI("/e2-demo"), NonRootMenuApp) whose @Menu entries are typed with PAGE classes
// (Section1, a nested Reports > Monthly group, ValidationForm) plus a route-typed entry whose field
// name differs from the route it names. A menu click, a deep link and a reload must land on the
// page — not reload the app shell over and over (the loop a route repeating the mount used to
// cause: the app answered for its own content with that route as its home).

/** Counts the Mateu round trips the page makes from now on. */
function countSyncs(page: Page) {
  const counter = { n: 0 };
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/mateu/v3/')) counter.n++;
  });
  return counter;
}

/** The page has stopped asking the server: no loop. */
async function expectSettled(page: Page, counter: { n: number }) {
  await page.waitForTimeout(1500);
  const settled = counter.n;
  await page.waitForTimeout(1500);
  expect(counter.n, 'the shell keeps reloading').toBe(settled);
}

test.describe('Non-root app with page-typed menu entries (/e2-demo)', () => {

  test('a deep link lands on the page', async ({ page }) => {
    const syncs = countSyncs(page);
    await page.goto('/e2-demo/page');

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page).toHaveURL(/\/e2-demo\/page$/);
    await expectSettled(page, syncs);
    expect(syncs.n).toBeLessThanOrEqual(3);
  });

  test('a reload of the deep link lands on the same page', async ({ page }) => {
    await page.goto('/e2-demo/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    const syncs = countSyncs(page);
    await page.reload();

    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page).toHaveURL(/\/e2-demo\/page$/);
    await expectSettled(page, syncs);
    expect(syncs.n).toBeLessThanOrEqual(3);
  });

  test('a deep link into a nested group lands on its page', async ({ page }) => {
    const syncs = countSyncs(page);
    await page.goto('/e2-demo/reports/monthly');

    await expect(page.getByText('Section 2').first()).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expectSettled(page, syncs);
  });

  test('menu clicks load each page inside the shell', async ({ page }) => {
    await page.goto('/e2-demo/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    const syncs = countSyncs(page);
    await page.getByText('Validation', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/e2-demo\/validation$/);
    await expect(page.getByRole('button', { name: 'Validate' })).toBeVisible();
    await expectSettled(page, syncs);

    await page.getByText('Page', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/e2-demo\/page$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expectSettled(page, syncs);
  });

  test('a route-typed entry goes to the route it names', async ({ page }) => {
    await page.goto('/e2-demo/page');
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

    await page.getByText('Routed page', { exact: true }).first().click();

    await expect(page.getByLabel('Note')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Note')).toBeVisible();
  });

  test('a content load whose route repeats the mount answers the page, not the app', async ({ request }) => {
    const response = await request.post('/e2-demo/mateu/v3/sync/e2-demo/page', {
      data: {
        route: '/e2-demo/page',
        consumedRoute: '',
        actionId: '',
        serverSideType: 'io.mateu.sample1.NonRootMenuApp',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    const body = Array.isArray(json) ? json[0] : json;
    const types = body.fragments.map((f: any) => f.component?.serverSideType ?? f.component?.metadata?.type);
    expect(types).toContain('io.mateu.sample1.Section1');
    expect(types).not.toContain('App');
  });
});
