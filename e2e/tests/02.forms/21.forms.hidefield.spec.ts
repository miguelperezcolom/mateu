import { test, expect } from '@playwright/test';

test('hide field work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Hide field', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Hide field' })).toBeVisible()

  await expect(page.getByLabel('Whatever')).toBeVisible({visible: false})
  page.getByLabel('Yes').click()
  await expect(page.getByLabel('Whatever')).toBeVisible()

});

