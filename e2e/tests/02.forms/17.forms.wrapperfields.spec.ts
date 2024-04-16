import { test, expect } from '@playwright/test';

test('wraper fields work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Wrappers fields form', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Wrappers fields form' })).toBeVisible()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('null, null, null, null')

  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').fill('15')
  await page.getByLabel('Rating').fill('5000')
  await page.getByLabel('Yes').click()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('Mateu, 15, 5000.0, true')


});

