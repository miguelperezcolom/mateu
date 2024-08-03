import { test, expect } from '@playwright/test';

test('file upload works', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Refs' }).click()
  await page.getByRole('option', { name: 'Files', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'External refs and files' })).toBeVisible()

  await expect(page.getByLabel('Assessment')).toHaveText('')

  await page.getByTestId('singleFileAsString').locator('#fileInput').setInputFiles('./tests/files/mateu1.jpg')
  await page.getByTestId('singleFileAsString').locator('#fileInput').blur()
  await expect(page.getByTestId('singleFileAsString')).toContainText('mateu1.jpg')

  await page.getByTestId('filesAsStrings').locator('#fileInput').setInputFiles(['./tests/files/mateu2.jpg', './tests/files/mateu3.jpg'])
  await page.getByTestId('filesAsStrings').locator('#fileInput').blur()
  await expect(page.getByTestId('filesAsStrings')).toContainText('mateu2.jpg')
  await expect(page.getByTestId('filesAsStrings')).toContainText('mateu3.jpg')

  await page.getByTestId('action-component-0___assess').click()

  await expect(page.getByLabel('Assessment')).toContainText('mateu1.jpg')
  await expect(page.getByLabel('Assessment')).toContainText('mateu2.jpg')
  await expect(page.getByLabel('Assessment')).toContainText('mateu3.jpg')


});

