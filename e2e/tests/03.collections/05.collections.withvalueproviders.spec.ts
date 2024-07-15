import { test, expect } from '@playwright/test';

test('collections with value providers work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'With values providers collections', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Arrays and collections' })).toBeVisible()


  await expect(page.getByTestId('chooseStrings').getByText('Red')).toBeVisible()
  await expect(page.getByTestId('chooseStrings').getByText('Blue')).toBeVisible()

  await expect(page.getByLabel('Red')).toBeChecked({checked: false})
  await expect(page.getByLabel('Blue')).toBeChecked()
  await expect(page.getByLabel('Yellow')).toBeChecked()
  await expect(page.getByLabel('Orange')).toBeChecked({checked: false})

  await expect(page.getByTestId('chooseInts').getByText('3')).toBeVisible()
  await expect(page.getByTestId('chooseInts').getByText('7')).toBeVisible()

  await expect(page.getByLabel('1')).toBeChecked()
  await expect(page.getByLabel('2')).toBeChecked({checked: false})
  await expect(page.getByLabel('5')).toBeChecked({checked: false})
  await expect(page.getByLabel('7')).toBeChecked()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [Red, Blue], [Yellow, Blue], [3, 7], [1, 7]')

  await page.getByTestId('chooseStrings').getByTitle('Red').getByRole('button').click()
  await page.getByTestId('chooseInts').getByTitle('7').getByRole('button').click()

  await page.getByTestId('chooseStrings').locator('#toggleButton').click()
  await page.getByRole('option', { name: 'Green' }).click()
  await page.getByTestId('chooseStrings').locator('#toggleButton').click()
  await page.getByTestId('chooseInts').locator('#toggleButton').click()
  await page.getByRole('option', { name: '1' }).click()
  await page.getByTestId('chooseInts').locator('#toggleButton').click()

  await page.getByLabel('Red').click()
  await expect(page.getByLabel('Red')).toBeChecked()
  await page.getByLabel('Blue').click()
  await expect(page.getByLabel('Blue')).toBeChecked({checked: false})

  await page.getByLabel('1').click()
  await expect(page.getByLabel('1')).toBeChecked({checked: false})
  await page.getByLabel('2').click()
  await expect(page.getByLabel('2')).toBeChecked()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [Blue, Green], [Yellow, Red], [3, 1], [1, 7, 2]')

  await expect(page.getByTestId('chooseStrings').getByText('Blue')).toBeVisible()
  await expect(page.getByTestId('chooseStrings').getByText('Green')).toBeVisible()

  await expect(page.getByLabel('Red')).toBeChecked()
  await expect(page.getByLabel('Blue')).toBeChecked({checked: false})
  await expect(page.getByLabel('Yellow')).toBeChecked()
  await expect(page.getByLabel('Orange')).toBeChecked({checked: false})

  await expect(page.getByTestId('chooseInts').getByText('3')).toBeVisible()
  await expect(page.getByTestId('chooseInts').getByText('1')).toBeVisible()

  await expect(page.getByLabel('1')).toBeChecked()
  await expect(page.getByLabel('2')).toBeChecked()
  await expect(page.getByLabel('5')).toBeChecked({checked: false})
  await expect(page.getByLabel('7')).toBeChecked()
});

