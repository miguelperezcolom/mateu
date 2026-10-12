import { test, expect, Page } from '@playwright/test';

/**
 * The app-shell walkthrough (design/walkthrough/app-shell.md), renderer-agnostic half: sample1's
 * ShellApp (@UI("/shell")) walked on whatever renderer serves it — Vaadin (renderer-vaadin) and
 * Redwood/VB (renderer-vb). Only what both draw the same way is asserted: navigation entries by
 * their text, the screens by their content, the toasts by their text.
 */

/** A navigation entry (a menu-bar item on Vaadin, a button of the subheader on Redwood). */
const nav = (page: Page, name: string) =>
  page.getByRole('navigation').getByText(name, { exact: true }).first();

const submit = (page: Page) => expect(page.getByRole('button', { name: 'Submit' })).toBeVisible({ timeout: 20000 });

test.describe('App shell on any renderer (/shell)', () => {

  test('a menu entry navigates, and its deep link survives a reload', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible({ timeout: 20000 });
    await nav(page, 'Page').click();
    await expect(page).toHaveURL(/\/shell\/page$/);
    await submit(page);
    await page.reload();
    await submit(page);
  });

  test('a group opens and reaches its page', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible({ timeout: 20000 });
    await nav(page, 'Reports').click();
    await page.getByRole('menuitem', { name: 'Monthly', exact: true }).click();
    await expect(page).toHaveURL(/\/shell\/reports\/monthly$/);
    await expect(page.getByLabel('Description')).toBeVisible({ timeout: 20000 });
  });

  test('a rule leaf runs the app\'s action', async ({ page }) => {
    await page.goto('/shell/probe');
    await expect(page.getByRole('button', { name: 'Where am i' })).toBeVisible({ timeout: 20000 });
    await nav(page, 'Ping').click();
    await expect(page.getByText('pong').filter({ visible: true }).first()).toBeVisible({ timeout: 20000 });
    await expect(page).toHaveURL(/\/shell\/probe$/);
  });

  test('a header action runs on the app', async ({ page }) => {
    await page.goto('/shell/page');
    await submit(page);
    await page.getByRole('button', { name: 'Sync', exact: true }).click();
    await expect(page.getByText(/synced/).filter({ visible: true }).first()).toBeVisible({ timeout: 20000 });
  });

  test('routes.yaml of the mount: a pinned param and a record master with its default tab', async ({ page }) => {
    await page.goto('/shell/orders/pending');
    await page.getByRole('button', { name: 'Show status' }).click();
    await expect(page.getByText('status=pending').first()).toBeVisible({ timeout: 20000 });

    await page.goto('/shell/customers/7');
    await expect(page.getByText('Customer 7').first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Which customer' }).click();
    await expect(page.getByText('orders of 7').first()).toBeVisible({ timeout: 20000 });
  });
});
