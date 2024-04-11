import { test, expect } from '@playwright/test';

test('basic fields work', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Basic fields' }).click()

  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()
  await expect(page.getByText('This is the subtitle')).toBeVisible()
  await expect(page.getByText('This is the status!')).toBeVisible()
  await expect(page.getByText('It works!')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible()

  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveValue('Mateu')

  await expect(page.getByTestId('withPlaceholder').getByPlaceholder('This should appear as the placeholder')).toBeVisible()

  await expect(page.getByLabel('Age')).toBeVisible()
  await expect(page.getByLabel('Age')).toHaveValue('15')

  await expect(page.getByLabel('Balance')).toBeVisible()
  await expect(page.getByLabel('Balance')).toHaveValue('20.31')

  await expect(page.getByTestId('assessment')).toBeVisible()
  await expect(page.getByTestId('assessment').locator('vaadin-input-container')).toHaveText('')

  await page.getByTestId('action-component-0___assess').click()


  await expect(page.getByLabel('Assessment')).toHaveText(/Mateu, 15, 20.31/)
  console.log('text', await page.getByTestId('assessment').locator('vaadin-input-container').textContent())

  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(/Antonia, 15, 20.31/)

  await page.getByLabel('With placeholder').clear()
  await page.getByLabel('With placeholder').fill('Hola')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(/Antonia, 15, 20.31, Hola/)

  await page.getByLabel('Age').clear()
  await page.getByLabel('Age').fill('47')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(/Antonia, 47, 20.31, Hola/)

  await page.getByLabel('Balance').clear()
  await page.getByLabel('Balance').fill('10.15')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(/Antonia, 47, 10.15, Hola/)

});
