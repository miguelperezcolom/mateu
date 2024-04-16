import { test, expect } from '@playwright/test';

test('wizard work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Wizard', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 1' })).toBeVisible()

  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByRole('button', { name: 'Go to next page' }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 2' })).toBeVisible()
  await page.getByLabel('Job').fill('Student')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 1' })).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveValue('Mateu')
  await page.getByRole('button', { name: 'Go to next page' }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 2' })).toBeVisible()
  await page.getByLabel('Job').fill('Student')
  await page.getByRole('button', { name: 'Go to next page' }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 3' })).toBeVisible()
  await page.getByRole('button', { name: 'End' }).click()
  await expect(page.getByRole('heading', { name: 'Null , student , mateu , 15' })).toBeVisible()
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.locator('h2', { hasText: 'Wizard page 3' })).toBeVisible()


});

