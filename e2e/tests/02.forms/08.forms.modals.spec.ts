import { test, expect } from '@playwright/test';

test('modals show up', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Modals', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Open modal', exact: true }).locator('div').click()
  await expect(page.getByText('Wizard page 1')).toBeVisible()
  await page.getByRole('button').first().click()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Open modal 2', exact: true }).locator('div').click()
  await expect(page.getByText('User details')).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Open modal 2', exact: true }).locator('div').click()
  await expect(page.getByText('User details')).toBeVisible()

});
