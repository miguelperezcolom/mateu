import { test, expect } from '@playwright/test';

test('urls and text work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Url and text', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Url and text' })).toBeVisible()

  await expect(page.getByRole('link', { name: 'Google' })).toBeVisible()
  await expect(page.getByTestId('someMessage').getByText('Lorem ipsum')).toBeVisible()
  await expect(page.getByTestId('anotherMessage').getByText('Lorem ipsum')).toBeVisible()
  await expect(page.getByTestId('anotherMessage').locator('b').getByText('consectetur adipiscing elit')).toBeVisible()

});

