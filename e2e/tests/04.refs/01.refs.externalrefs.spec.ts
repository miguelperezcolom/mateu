import { test, expect } from '@playwright/test';

test('external refs work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Refs' }).click()
  await page.getByRole('option', { name: 'External refs', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'External refs and files' })).toBeVisible()


  await expect(page.getByLabel('Team at san francisco')).toBeVisible()
  await expect(page.getByLabel('Team at san francisco')).toHaveValue('San Francisco 49ers')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('null, San Francisco 49ers')

  await page.getByTestId('yourFavouritePlayer').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Davante Adams' }).click()

  await page.getByTestId('teamAtSanFrancisco').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Los Angeles Rams' }).click()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('Davante Adams, Los Angeles Rams')
});

