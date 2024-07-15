import { test, expect } from '@playwright/test';

test('nested dropdowns work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Nested dropdowns', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Nested dropdowns' })).toBeVisible()


  await page.getByLabel('Spain').click()
  await page.getByLabel('Spanish city').click()
  await page.getByRole('option', { name: 'Palma' }).click()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', Spain, Palma, null, null, null')

  await page.getByLabel('Country again').click()
  await page.getByRole('option', { name: 'Spain' }).click()
  await page.getByTestId('city').getByLabel('City').click()
  await page.getByRole('option', { name: 'Palma de Mallorca' }).click()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', Spain, Palma, null, Spain, pmi')

});

