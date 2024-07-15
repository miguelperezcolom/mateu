import { test, expect } from '@playwright/test';

test('action is called on change', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Call action on change', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Call action on change' })).toBeVisible()

  await expect(page.getByLabel('Assessment')).toHaveText('')

  await page.getByTestId('age').locator('vaadin-input-container div').nth(2).click()
  await expect(page.getByLabel('Assessment')).toHaveText('Mateu, 16, 20.31')


});

