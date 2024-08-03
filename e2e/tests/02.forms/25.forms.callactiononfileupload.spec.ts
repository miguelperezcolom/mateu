import { test, expect } from '@playwright/test';

test('action is called on file upload', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Call action on file upload', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Call action on file upload' })).toBeVisible()

  await expect(page.getByLabel('Assessment')).toHaveText('')

  await page.getByTestId('uploadFile').locator('#fileInput').setInputFiles('./tests/files/mateu.jpg')
  await page.getByTestId('uploadFile').locator('#fileInput').blur()
  await expect(page.getByTestId('uploadFile')).toContainText('mateu.jpg')

  await expect(page.getByLabel('Assessment')).toContainText('mateu.jpg')


});

