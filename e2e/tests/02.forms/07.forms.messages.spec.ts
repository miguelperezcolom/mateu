import { test, expect } from '@playwright/test';

test('messages show up', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Messages', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Message target' }).locator('div').click()
  await expect(page.getByText('Hello Mateu')).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Show message', exact: true }).locator('div').click()
  await expect(page.getByText('Your name is Mateu')).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Throws exception' }).locator('div').click()
  await expect(page.getByRole('alert').getByText('This is the description of teh exception')).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Show message after' }).locator('div').click()
  await expect(page.getByText('Some result')).toBeVisible()
  await expect(page.locator("[role='alert'][theme='primary']").getByText('Your name is Mateu')).toBeVisible()

});
