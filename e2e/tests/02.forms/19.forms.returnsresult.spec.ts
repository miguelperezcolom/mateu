import { test, expect } from '@playwright/test';

test('returns result', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Returns result', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Returns result' })).toBeVisible()


  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByTestId('action-component-0___doSomething').click()
  await page.getByTestId('dialog-confirm').click()
  await expect(page.getByText('It worked')).toBeVisible()
  page.getByText('Back to Returns result').click()
  await expect(page.locator('h2', { hasText: 'Returns result' })).toBeVisible()
  page.getByText('Do something big').click()
  await page.getByTestId('dialog-confirm').click()
  await expect(page.getByText('It worked, also!')).toBeVisible()
  page.getByText('Back to Returns result').click()
  await expect(page.locator('h2', { hasText: 'Returns result' })).toBeVisible()

});

