import { test, expect } from '@playwright/test';

test('no redundant back and cancel buttons for delete row', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Cruds' }).click()
  await page.getByRole('option', { name: 'Programming Languages'}).click()
  await expect(page.getByRole('heading', { name: 'Programming languages' })).toBeVisible()

  await page.getByRole('button', { name: 'Search' }).click()

  await page.locator('vaadin-checkbox').nth(2).click()
  await page.locator('vaadin-checkbox').nth(3).click()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Remove selected', exact: true }).locator('div').click()

  await page.getByTestId('dialog-confirm').click()

  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible({visible: false})

});
