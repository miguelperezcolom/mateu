import { test, expect } from '@playwright/test';

test('actions with parameters work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Actions with parameters', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Actions with parameters' })).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Both' }).locator('div').click()
  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByRole('button', { name: 'Run' }).click()
  await expect(page.getByLabel('Some text')).toHaveValue('Mateu')
  await expect(page.getByLabel('Some value')).toHaveValue('15')

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Say hello' }).locator('div').click()
  await page.getByLabel('Name').fill('Antonia')
  await page.getByLabel('Age').fill('47')
  await page.getByRole('button', { name: 'Run' }).click()
  await expect(page.getByLabel('Some text')).toHaveValue('Antonia')
  await expect(page.getByLabel('Some value')).toHaveValue('47')

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Both' }).locator('div').click()
  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByLabel('Some text')).toHaveValue('Antonia')
  await expect(page.getByLabel('Some value')).toHaveValue('47')


});

