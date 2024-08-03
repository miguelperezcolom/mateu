import { test, expect } from '@playwright/test';

test('returns basic work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Returns basic', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Returns basic' })).toBeVisible()


  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Say hello' }).locator('div').click()
  await expect(page.getByText('Hello mateu, aged 15')).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()


  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Show rating' }).locator('div').click()
  await expect(page.getByText('5')).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.locator('h2', { hasText: 'Returns basic' })).toBeVisible()

});

