import { test, expect } from '@playwright/test';

test('dates work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Dates', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Dates' })).toBeVisible()

  var today = new Date().toISOString().slice(0, -14) //yyyy-MM-dd

  await page.getByTestId('date').locator('vaadin-input-container div').nth(1).click()
  await page.getByRole('button', { name: 'Today' }).click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', ' + today + ', null, null')

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+ArrowDown');
  await page.waitForTimeout(500)
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.getByTestId('dateAndTime').locator('#toggleButton').click()
  await page.getByRole('option', { name: '01:00' }).click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', ' + today + ', ' + today + 'T01:00, null')

  await page.getByTestId('time').locator('#toggleButton').click()
  await page.getByRole('option', { name: '01:00' }).click()
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText(', ' + today + ', ' + today + 'T01:00, 01:00')


});

