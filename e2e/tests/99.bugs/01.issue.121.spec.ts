import { test, expect } from '@playwright/test';

test('next and previous not visible when back to crud list', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Cruds' }).click()
  await page.getByRole('option', { name: 'NFL'}).click()
  await page.getByRole('option', { name: 'Players'}).click()
  await expect(page.getByRole('heading', { name: 'Players' })).toBeVisible()

  await page.getByText('Edit').first().click()
  await page.getByTestId('action-component-0___cancel').click()

  await expect(page.getByText('Previous Next')).toHaveCount(0)
});
