import { test, expect } from '@playwright/test';

test('collections od enums work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'Enums collections', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Arrays and collections' })).toBeVisible()


  await expect(page.getByTestId('enums-East').getByLabel('East')).toBeChecked()
  await expect(page.getByTestId('enums-West').getByLabel('West')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-South').getByLabel('South')).toBeChecked()

  await expect(page.getByTestId('enumsCollection-East').getByLabel('East')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-West').getByLabel('West')).toBeChecked()
  await expect(page.getByTestId('enumsCollection-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-South').getByLabel('South')).toBeChecked()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [East, South], [South, West]')


  await expect(page.getByTestId('enums-East').getByLabel('East')).toBeChecked()
  await expect(page.getByTestId('enums-West').getByLabel('West')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-South').getByLabel('South')).toBeChecked()

  await expect(page.getByTestId('enumsCollection-East').getByLabel('East')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-West').getByLabel('West')).toBeChecked()
  await expect(page.getByTestId('enumsCollection-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-South').getByLabel('South')).toBeChecked()

  await page.getByTestId('enums-East').getByLabel('East').click()
  await page.getByTestId('enums-West').getByLabel('West').click()
  await page.getByTestId('enumsCollection-East').getByLabel('East').click()
  await page.getByTestId('enumsCollection-West').getByLabel('West').click()

  await expect(page.getByTestId('enums-East').getByLabel('East')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-West').getByLabel('West')).toBeChecked()
  await expect(page.getByTestId('enums-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enums-South').getByLabel('South')).toBeChecked()

  await expect(page.getByTestId('enumsCollection-East').getByLabel('East')).toBeChecked()
  await expect(page.getByTestId('enumsCollection-West').getByLabel('West')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-North').getByLabel('North')).toBeChecked({checked: false})
  await expect(page.getByTestId('enumsCollection-South').getByLabel('South')).toBeChecked()


  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', [South, West], [South, East]')

});

