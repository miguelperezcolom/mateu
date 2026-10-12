import { test, expect, Page } from '@playwright/test';

// The canonical page header, walked (sample1 PageAnatomy, /arch/page): every element a page can
// carry — overline, title, subtitle, header badge, KPI, timestamp, record switcher, peer
// navigation, toolbar and bottom buttons, static and action-returned banners, a FAB — and the page
// width. Each interaction must reach the server and come back where it belongs.

const toast = (page: Page, text: string) =>
  expect(page.locator('vaadin-notification-card').filter({ hasText: text }).first()).toBeVisible();

test.describe('Page anatomy (/arch/page)', () => {
  let problems: string[];

  test.beforeEach(async ({ page }) => {
    problems = [];
    page.on('console', (m) => {
      if (m.text().includes('no component on the page handles it')) problems.push(m.text());
    });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await page.goto('/arch/page');
    await expect(page.getByRole('heading', { name: 'Requisition 4471' })).toBeVisible();
  });

  test.afterEach(() => {
    expect(problems).toEqual([]);
  });

  test('the header shows every element and names the window', async ({ page }) => {
    await expect(page.getByText('Requisitions', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending approval')).toBeVisible();
    await expect(page.getByText('1,240 €')).toBeVisible();
    await expect(page.getByText('Last updated 2026-07-20 12:00')).toBeVisible();
    await expect(page.getByText('Approved', { exact: true })).toBeVisible();
    await expect(page.getByText('Static banner text')).toBeVisible();
    await expect(page).toHaveTitle('Requisition 4471');
    await expect(page.locator('mateu-ux[data-page-width="fixed"]').first()).toBeAttached();
  });

  test('banners returned by actions replace or append', async ({ page }) => {
    await page.getByRole('button', { name: 'Append banner' }).click();
    await expect(page.getByText('Another one')).toHaveCount(1);
    await page.getByRole('button', { name: 'Append banner' }).click();
    await expect(page.getByText('Another one')).toHaveCount(2);
    await page.getByRole('button', { name: 'Warn' }).click();
    await expect(page.getByText('Returned by an action')).toBeVisible();
    // a bare PageBanner replaces the action banners
    await expect(page.getByText('Another one')).toHaveCount(0);
    // the static one stays
    await expect(page.getByText('Static banner text')).toBeVisible();
  });

  test('the FAB and the record switcher run on the server', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await toast(page, 'Fab pressed');
    await page.locator('select').first().selectOption('4472');
    await toast(page, 'Switched to 4472');
  });

  test('peer navigation goes to the next record, and back returns', async ({ page }) => {
    await page.getByRole('button', { name: 'Welcome' }).click();
    await expect(page).toHaveURL(/\/arch\/welcome$/);
    await expect(page.getByText('Front desk check-in')).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Requisition 4471' })).toBeVisible();
  });
});

test.describe('Welcome banner element (/arch/welcome-banner)', () => {
  test('the banner sits on top of an ordinary form, with no accent strip', async ({ page }) => {
    await page.goto('/arch/welcome-banner');
    await expect(page.getByText('Good morning, Ada')).toBeVisible();
    await expect(page.getByText('Three arrivals today')).toBeVisible();
    await expect(page.locator('mateu-ux[data-has-welcome-banner]').first()).toBeAttached();
  });
});
