import { test, expect } from '@playwright/test';

test('disable field work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Disable field', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Disable field' })).toBeVisible()

  await expect(page.getByLabel('Whatever')).toBeEnabled({enabled: false})
  page.getByLabel('Yes').click()
  await expect(page.getByLabel('Whatever')).toBeEnabled()
  page.getByLabel('Yes').click()
  await expect(page.getByLabel('Whatever')).toBeEnabled({enabled: false})

});

