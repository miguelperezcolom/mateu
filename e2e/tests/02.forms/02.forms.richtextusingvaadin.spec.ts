import { test, expect } from '@playwright/test';

test('rich text using vaadin works', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Rich text using vaadin', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Text' })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Text' })).toBeVisible()

  await expect(page.getByLabel('Text')).toBeVisible()
  await expect(page.getByLabel('Text').getByRole('textbox')).toHaveText('Hello Mateu.')

  await page.getByLabel('Text').getByRole('textbox').click({clickCount: 3})
  await page.getByLabel('Text').getByRole('textbox').press('Delete')
  await expect(page.getByLabel('Text').getByRole('textbox')).toHaveText('')
  await page.getByLabel('Text').getByRole('textbox').click()
  await page.getByLabel('Text').getByRole('textbox').pressSequentially('H')
  await page.getByLabel('Text').getByRole('textbox').click()
  await page.getByLabel('Text').getByRole('textbox').pressSequentially('o')
  await page.getByLabel('Text').getByRole('textbox').click()
  await page.getByLabel('Text').getByRole('textbox').pressSequentially('l')
  await page.getByLabel('Text').getByRole('textbox').click()
  await page.getByLabel('Text').getByRole('textbox').pressSequentially('a')
  await expect(page.getByLabel('Text').getByRole('textbox')).toHaveText('Hola')

  await page.getByRole('button', { name: 'Assess' }).click()
  await expect(page.getByLabel('Assessment')).toHaveText('<p>Hola</p>')

});
