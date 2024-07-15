import { test, expect } from '@playwright/test';

test('one to many work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Refs' }).click()
  await page.getByRole('option', { name: 'One to many relationships', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'One to many relationships' })).toBeVisible()


  await page.getByTestId('array').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Los Angeles Rams' }).click()
  await page.getByRole('option', { name: 'Las Vegas Raiders' }).click()
  await page.getByTestId('array').locator('#toggleButton').click()

  await page.getByTestId('list').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Atlanta Falcons' }).click()
  await page.getByRole('option', { name: 'New York Giants' }).click()
  await page.getByTestId('list').locator('#toggleButton').click()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[Los Angeles Rams, Las Vegas Raiders], [Atlanta Falcons, New York Giants]')

  await page.getByTestId('array').getByTitle('Los Angeles Rams').getByRole('button').click()
  await page.getByTestId('list').getByTitle('New York Giants').getByRole('button').click()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[Las Vegas Raiders], [Atlanta Falcons]')
});

