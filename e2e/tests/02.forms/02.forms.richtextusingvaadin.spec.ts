import { test, expect } from '@playwright/test';

test('rich text using vaadin works', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Rich text using vaadin', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Text' })).toBeVisible()

  await expect(page.getByLabel('Text')).toBeVisible()
  await expect(page.getByLabel('Text')).toHaveValue('Hello <b>Mateu</b>.')

  await page.getByLabel('Text').clear()
  await page.getByLabel('Text').fill('Hola')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('Hola')
});
