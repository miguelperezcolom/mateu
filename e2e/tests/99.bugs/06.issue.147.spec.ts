import { test, expect } from '@playwright/test';

test('bad life sale works', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Use cases' }).click()
  await page.getByRole('option', { name: 'Sell bad life', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Bad life sale' })).toBeVisible()

  await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible()
  await page.getByRole('button', { name: 'Calculate' }).click()

  await expect(page.locator('h2', { hasText: 'Price Selection Form' })).toBeVisible()

});

