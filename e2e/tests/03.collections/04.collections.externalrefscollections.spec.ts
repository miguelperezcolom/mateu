import { test, expect } from '@playwright/test';

test('collections of external refs work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'External refs collections', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Arrays and collections' })).toBeVisible()


  await expect(page.getByTestId('teams').getByText('Las Vegas Raiders')).toBeVisible()
  await expect(page.getByTestId('teams').getByText('Seattle Seahawks')).toBeVisible()

  await expect(page.getByTestId('teamsCollection').getByText('Las Vegas Raiders')).toBeVisible()
  await expect(page.getByTestId('teamsCollection').getByText('Seattle Seahawks')).toBeVisible()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [Las Vegas Raiders, Seattle Seahawks], [Las Vegas Raiders, Seattle Seahawks]')

  await page.getByTestId('teams').getByTitle('Las Vegas Raiders').getByRole('button').click()
  await page.getByTestId('teamsCollection').getByTitle('Seattle Seahawks').getByRole('button').click()

  await page.getByTestId('teams').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Los Angeles Rams' }).click()
  await page.getByTestId('teams').locator('#toggleButton').click()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [Seattle Seahawks, Los Angeles Rams], [Las Vegas Raiders]')

});

