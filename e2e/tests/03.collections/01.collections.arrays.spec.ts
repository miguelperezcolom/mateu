import { test, expect } from '@playwright/test';

test('arrays work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'Arrays', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Arrays and collections' })).toBeVisible()


  await expect(page.getByTestId('booleans').locator('input')).toHaveValue('0010')
  await expect(page.getByTestId('ints').locator('input')).toHaveValue('1,2,3,5')
  await expect(page.getByTestId('doubles').locator('input')).toHaveValue('1.2,3.4,5.1')
  await expect(page.getByTestId('strings').locator('input')).toHaveValue('Mateu,Antònia,Miguel')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[false, false, true, false],[1, 2, 3, 5],[1.2, 3.4, 5.1],[Mateu, Antònia, Miguel]')


  await page.getByTestId('booleans').locator('input').fill('010')
  await page.getByTestId('ints').locator('input').fill('9,8,7')
  await page.getByTestId('doubles').locator('input').fill('2.1,3')
  await page.getByTestId('strings').locator('input').fill('Mateu')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[false, true, false],[9, 8, 7],[2.1, 3.0],[Mateu]')


  await page.getByTestId('booleans').locator('input').fill('')
  await page.getByTestId('ints').locator('input').fill('')
  await page.getByTestId('doubles').locator('input').fill('')
  await page.getByTestId('strings').locator('input').fill('')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[],[],[],[]')

});

