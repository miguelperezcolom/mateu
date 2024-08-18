import { test, expect } from '@playwright/test';

test('navigation in modals works as expected', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Modals'}).click()
  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Open modal', exact: true }).locator('div').click()
  await expect(page.getByText('Wizard page 1')).toBeVisible()
  await expect(page.getByRole('button', {name: 'Back'})).toBeVisible({visible: false})
  await page.getByRole('button', { name: 'Go to next page' }).click()
  await expect(page.getByText('Wizard page 2')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  await page.getByRole('button').first().click()

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Assess', exact: true }).locator('div').click()
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({visible: false})

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Open modal', exact: true }).locator('div').click()
  await expect(page.getByText('Wizard page 1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({visible: false})


});
