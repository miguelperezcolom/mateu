import { test, expect } from '@playwright/test';

test('tabs work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Tabs', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()


  await expect(page.getByRole('tab', { name: 'Tab 1' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Tab 2' })).toBeVisible()

  await expect(page.getByTestId('name')).toBeVisible()
  page.getByRole('tab', { name: 'Tab 2' }).click()
  await expect(page.getByTestId('age')).toBeVisible()

});
