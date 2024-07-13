import { test, expect } from '@playwright/test';

test('complex collections work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'Complex collections', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Complex collections' })).toBeVisible()

  await expect(page.getByLabel('Assessment')).toHaveText('')

  await expect(page.getByTestId("addresses")).toBeVisible()
  await expect(page.getByTestId("addresses").getByText('Addresses')).toBeVisible()
  await expect(page.getByTestId("addresses").getByLabel('Street')).toBeVisible()
  await expect(page.getByTestId("addresses").getByLabel('City')).toBeVisible()
  await expect(page.getByTestId("addresses").getByLabel('Postal code')).toBeVisible()
  await expect(page.getByTestId("addresses").getByLabel('Country')).toBeVisible()
  await expect(page.getByTestId("addresses").getByRole('button', { name: 'New item' })).toBeVisible()
  await expect(page.getByTestId("addresses").locator('.delete-button')
      .filter({ hasText: 'Delete...' })).toBeVisible()
  await expect(page.getByTestId("addresses").locator('.delete-button').getByRole('button')).toBeDisabled()

  await page.getByTestId("addresses").getByRole('button', { name: 'New item' }).click()
  await expect(page.getByLabel('New Addresses')).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByLabel('Street')).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByLabel('City')).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByLabel('Postal code')).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByLabel('Country')).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByLabel('New Addresses').getByRole('button', { name: 'Save' })).toBeVisible()

  await page.getByLabel('New Addresses').getByLabel('Street').clear()
  await page.getByLabel('New Addresses').getByLabel('Street').fill('aaaa')
  await page.getByLabel('New Addresses').getByLabel('City').clear()
  await page.getByLabel('New Addresses').getByLabel('City').fill('bbbb')
  await page.getByLabel('New Addresses').getByLabel('Postal code').clear()
  await page.getByLabel('New Addresses').getByLabel('Postal code').fill('cccc')
  await page.getByLabel('New Addresses').getByLabel('Country').clear()
  await page.getByLabel('New Addresses').getByLabel('Country').fill('dddd')
  await page.getByLabel('New Addresses').getByRole('button', { name: 'Save' }).click()

  await expect(page.getByTestId('addresses').getByText('aaaa')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('bbbb')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('cccc')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('dddd')).toBeVisible()

  await page.getByTestId("addresses").getByRole('button', { name: 'New item' }).click()
  await expect(page.getByLabel('New Addresses')).toBeVisible()

  await page.getByLabel('New Addresses').getByLabel('Street').clear()
  await page.getByLabel('New Addresses').getByLabel('Street').fill('1111')
  await page.getByLabel('New Addresses').getByLabel('City').clear()
  await page.getByLabel('New Addresses').getByLabel('City').fill('2222')
  await page.getByLabel('New Addresses').getByLabel('Postal code').clear()
  await page.getByLabel('New Addresses').getByLabel('Postal code').fill('3333')
  await page.getByLabel('New Addresses').getByLabel('Country').clear()
  await page.getByLabel('New Addresses').getByLabel('Country').fill('4444')
  await page.getByLabel('New Addresses').getByRole('button', { name: 'Save' }).click()

  await expect(page.getByTestId('addresses').getByText('aaaa')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('bbbb')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('cccc')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('dddd')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('1111')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('2222')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('3333')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('4444')).toBeVisible()

  await page.getByTestId('addresses').getByRole('button', { name: 'Edit' }).first().click()
  await page.getByLabel('New Addresses').getByLabel('Street').clear()
  await page.getByLabel('New Addresses').getByLabel('Street').fill('aaxaa')
  await page.getByLabel('New Addresses').getByLabel('City').clear()
  await page.getByLabel('New Addresses').getByLabel('City').fill('bbxbb')
  await page.getByLabel('New Addresses').getByLabel('Postal code').clear()
  await page.getByLabel('New Addresses').getByLabel('Postal code').fill('ccxcc')
  await page.getByLabel('New Addresses').getByLabel('Country').clear()
  await page.getByLabel('New Addresses').getByLabel('Country').fill('ddxdd')
  await page.getByLabel('New Addresses').getByRole('button', { name: 'Save' }).click()

  await expect(page.getByTestId('addresses').getByText('aaxaa')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('bbxbb')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('ccxcc')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('ddxdd')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('1111')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('2222')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('3333')).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('4444')).toBeVisible()

  await page.getByTestId('addresses').getByText('aaxaa').click()
  await page.getByTestId('addresses').getByRole('button', { name: 'Delete...' }).click()
  await expect(page.getByTestId('addresses').getByText('aaxaa')).toBeHidden()
  await expect(page.getByTestId('addresses').getByText('bbxbb')).toBeHidden()
  await expect(page.getByTestId('addresses').getByText('ccxcc')).toBeHidden()
  await expect(page.getByTestId('addresses').getByText('ddxdd')).toBeHidden()
  await expect(page.getByTestId('addresses').getByText('1111').first()).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('2222').first()).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('3333').first()).toBeVisible()
  await expect(page.getByTestId('addresses').getByText('4444').first()).toBeVisible()



  await expect(page.getByTestId('preFilled').getByText('Arxiduc LLuís Salvador')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('Juan Crespí')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('Gran vía')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('Palma de Mallorca').first()).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('Madrid')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('07004')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('07014')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('01001')).toBeVisible()
  await expect(page.getByTestId('preFilled').getByText('Spain').first()).toBeVisible()

  await page.getByLabel('External refs').click()
  await page.getByRole('option', { name: 'New York Giants' }).click()
  await page.getByRole('option', { name: 'Seattle Seahawks' }).click()
  await page.locator('html').click()
  await expect(page.getByTitle('New York Giants')).toBeVisible()
  await expect(page.getByTitle('Seattle Seahawks')).toBeVisible()




  await page.getByTestId('action-component-0___assess').click()

  await expect(page.getByLabel('Assessment')).toContainText('1111')
  await expect(page.getByLabel('Assessment')).toContainText('2222')
  await expect(page.getByLabel('Assessment')).toContainText('3333')
  await expect(page.getByLabel('Assessment')).toContainText('4444')
  await expect(page.getByLabel('Assessment')).toContainText('Arxiduc')
  await expect(page.getByLabel('Assessment')).toContainText('Palma')
  await expect(page.getByLabel('Assessment')).toContainText('07004')
  await expect(page.getByLabel('Assessment')).toContainText('Spain')
  await expect(page.getByLabel('Assessment')).toContainText('New York Giants')
  await expect(page.getByLabel('Assessment')).toContainText('Seattle Seahawks')


});

