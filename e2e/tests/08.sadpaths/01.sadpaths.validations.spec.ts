import { test, expect } from '@playwright/test';

test('basic field validations work', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Basic fields' }).click()

  await expect(page.getByRole('heading', { name: 'This is the title' })).toBeVisible()

  await expect(page.getByLabel('Name')).toBeVisible()
  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').blur()
  console.log('aa', page.getByLabel('Name').getAttribute('invalid'))
  await expect(page.getByLabel('Name')).toHaveAttribute('invalid', '')

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Assess' }).locator('div').click()


  await expect(page.getByText('Several fields have errors (Name). Please fix.').first()).toBeVisible()

  await page.getByLabel('Name').fill('aa')
  await expect(page.getByLabel('Name')).not.toHaveAttribute('invalid', '')

  await page.getByLabel('Other save options').locator('svg').hover()
  await page.getByRole('option', { name: 'Assess' }).locator('div').click()
  await expect(page.getByLabel('Assessment')).toHaveText(/aa, 15, 20.31/)

});
