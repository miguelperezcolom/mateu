import { test, expect } from '@playwright/test';

test('telephone work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Telephone', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Telephone' })).toBeVisible()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByRole('alert').getByText('Several fields have errors')).toBeVisible()

  await page.getByTestId('home').getByRole('button').click()
  await page.getByTestId('home-+1').getByText('+1').click()
  await page.getByTestId('home').getByLabel('', { exact: true }).fill('123456789')


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('TelephoneNumber(prefix=+1, number=123456789), TelephoneNumber(prefix=+34, number=971123456)')


});

