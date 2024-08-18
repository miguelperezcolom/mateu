import { test, expect } from '@playwright/test';

test('text fields work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Form with callbacks', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Form with callbacks' })).toBeVisible()

  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveText('Mateu')

  await page.getByRole('button' , { name: 'Change name' }).click()
  await expect(page.getByRole('heading', { name: 'Change name form' })).toBeVisible()

  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')

  await page.getByRole('button' , { name: 'Save' }).click()

  await expect(page.getByRole('heading', { name: 'Form with callbacks' })).toBeVisible()

  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveText('Antonia')

  await expect(page.getByLabel('Age')).toBeVisible()
  await expect(page.getByLabel('Age')).toHaveText('16')

  await page.getByRole('button' , { name: 'Change age' }).click()
  await expect(page.getByRole('heading', { name: 'Change age form' })).toBeVisible()

  await page.getByLabel('Age').clear()
  await page.getByLabel('Age').fill('17')

  await page.getByRole('button' , { name: 'Save' }).click()

  await expect(page.getByRole('heading', { name: 'Form with callbacks' })).toBeVisible()

  await expect(page.getByLabel('Age')).toBeVisible()
  await expect(page.getByLabel('Age')).toHaveText('17')
});
