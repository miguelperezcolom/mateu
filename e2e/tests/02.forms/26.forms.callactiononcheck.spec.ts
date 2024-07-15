import { test, expect } from '@playwright/test';

test('action is called on check', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Call action on check', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Call action on check' })).toBeVisible()

  await expect(page.getByLabel('Assessment')).toHaveText('')

  await page.getByTestId('questions-2').getByLabel('The intermediary has...').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[1, 2]')

});

