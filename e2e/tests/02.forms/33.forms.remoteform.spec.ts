import { test, expect } from '@playwright/test';

test('remote form work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Remote form', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Pattern' })).toBeVisible()

});

