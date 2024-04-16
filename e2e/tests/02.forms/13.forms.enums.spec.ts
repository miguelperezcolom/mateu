import { test, expect } from '@playwright/test';

test('enums work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Enums', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Enums' })).toBeVisible()


  await page.getByLabel('American').click()
  await page.locator('#toggleButton').click()
  await page.getByRole('option', { name: 'West' }).locator('div').click()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', American, West')


});

