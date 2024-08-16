import { test, expect } from '@playwright/test';

test('no redundant back and cancel buttons for delete row', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Cruds' }).click()
  await page.getByRole('option', { name: 'Programming Languages'}).click()
  await expect(page.getByRole('heading', { name: 'Programming languages' })).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Add new language', exact: true }).locator('div').click()

  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({visible: false})

});
