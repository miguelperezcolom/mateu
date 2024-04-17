import { test, expect } from '@playwright/test';

test('collections work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'Collections', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Arrays and collections' })).toBeVisible()


  await expect(page.getByTestId('booleansCollection').locator('input')).toHaveValue('0010')
  await expect(page.getByTestId('intsCollection').locator('input')).toHaveValue('1,2,3,6')
  await expect(page.getByTestId('doublesCollection').locator('input')).toHaveValue('10.2,3.1,8.21')
  await expect(page.getByTestId('stringsCollection').locator('input')).toHaveValue('Mateu,Antonia,Miguel')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[false, false, true, false],[1, 2, 3, 6],[10.2, 3.1, 8.21],[Mateu, Antonia, Miguel]')


  await page.getByTestId('booleansCollection').locator('input').fill('010')
  await page.getByTestId('intsCollection').locator('input').fill('9,8,7')
  await page.getByTestId('doublesCollection').locator('input').fill('2.1,3')
  await page.getByTestId('stringsCollection').locator('input').fill('Mateu')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[false, true, false],[9, 8, 7],[2.1, 3.0],[Mateu]')


  await page.getByTestId('booleansCollection').locator('input').fill('')
  await page.getByTestId('intsCollection').locator('input').fill('')
  await page.getByTestId('doublesCollection').locator('input').fill('')
  await page.getByTestId('stringsCollection').locator('input').fill('')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('[],[],[],[]')

});

