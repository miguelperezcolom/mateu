import { test, expect } from '@playwright/test';

// The spring-mvc starter's path on a crud that is a MENU ENTRY of an app (/crud-in-menu,
// CrudInMenuApp): listing → click a row → Edit → change the name → Save. The record pages' actions
// bubble to the app, which sends its own route (still the listing's): the save was refused with
// "This record no longer exists" while the same record opened by its URL saved fine.
test.describe('crud save from the listing', () => {
  test.describe.configure({ mode: 'serial' });

  const nameField = (page) =>
    page.locator('vaadin-text-field').filter({ hasText: 'Name' }).locator('input').first();

  test('a record opened by clicking its row saves its edit', async ({ page }) => {
    const name = `Espresso machine ${Date.now()}`;
    await page.goto('/crud-in-menu/products');
    await page.locator('vaadin-grid').getByText(/Espresso machine/).first().click();
    await expect(page).toHaveURL(/\/crud-in-menu\/products\/M-001$/);

    await page.locator('vaadin-button').filter({ hasText: 'Edit' }).first().click();
    await expect(page).toHaveURL(/\/crud-in-menu\/products\/M-001\/edit$/);
    await nameField(page).fill(name);
    await page.locator('vaadin-button').filter({ hasText: 'Save' }).first().click();

    await expect(page).toHaveURL(/\/crud-in-menu\/products\/M-001$/);
    await expect(page.getByText('no longer exists')).toHaveCount(0);

    // stored: the listing shows the new name
    await page.goto('/crud-in-menu/products');
    await expect(page.locator('vaadin-grid').getByText(name)).toBeVisible();
  });

  test('a record opened by its url saves its edit too', async ({ page }) => {
    const name = `Coffee grinder ${Date.now()}`;
    await page.goto('/crud-in-menu/products/M-002');
    await page.locator('vaadin-button').filter({ hasText: 'Edit' }).first().click();
    await expect(page).toHaveURL(/\/crud-in-menu\/products\/M-002\/edit$/);
    await nameField(page).fill(name);
    await page.locator('vaadin-button').filter({ hasText: 'Save' }).first().click();

    await expect(page).toHaveURL(/\/crud-in-menu\/products\/M-002$/);
    await expect(page.getByText('no longer exists')).toHaveCount(0);
    await page.goto('/crud-in-menu/products');
    await expect(page.locator('vaadin-grid').getByText(name)).toBeVisible();
  });
});
