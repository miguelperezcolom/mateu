import { test, expect } from '@playwright/test';

test('checks work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Checks', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Booleans' })).toBeVisible()

  await page.getByTestId('check').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('true, false, false, null, null, null')

  await page.getByTestId('check').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, null, null, null')

  await page.getByTestId('usingRadioButtons-yes').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, true, false, null, null, null')

  await page.getByTestId('usingRadioButtons-no').getByLabel('No').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, null, null, null')

  await page.getByTestId('toggle').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, true, null, null, null')

  await page.getByTestId('toggle').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, null, null, null')




  await page.getByTestId('alsoCheck').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, true, null, null')

  await page.getByTestId('alsoCheck').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, false, null, null')

  await page.getByTestId('alsoUsingRadioButtons-yes').getByLabel('Yes').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, false, true, null')

  await page.getByTestId('alsoUsingRadioButtons-no').getByLabel('No').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, false, false, null')

  await page.getByTestId('alsoToggle').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, false, false, true')

  await page.getByTestId('alsoToggle').click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('false, false, false, false, false, false')


});
