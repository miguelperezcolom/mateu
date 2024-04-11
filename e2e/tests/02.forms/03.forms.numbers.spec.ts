import { test, expect } from '@playwright/test';

test('number fields work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Numbers', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Numbers' })).toBeVisible()


  await expect(page.getByTestId('anInt')).toBeVisible()
  await expect(page.getByTestId('anInt').getByLabel('An int')).toHaveValue('3')

  await page.getByTestId('anInt').getByLabel('An int').clear()
  await page.getByTestId('anInt').getByLabel('An int').fill('123')

  await page.getByTestId('anotherIntWithValidations').getByLabel('Another int with validations').fill('10')


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toContainText('123')



  await expect(page.getByTestId('aPrimitiveDouble')).toBeVisible()
  await expect(page.getByTestId('aPrimitiveDouble').getByLabel('A primitive double')).toHaveValue('1.2')

  await expect(page.getByTestId('aPrimitiveFloat')).toBeVisible()
  await expect(page.getByTestId('aPrimitiveFloat').getByLabel('A primitive float')).toHaveValue('2.3')

});
