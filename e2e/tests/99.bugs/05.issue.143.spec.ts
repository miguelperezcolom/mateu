import { test, expect } from '@playwright/test';

test('read only pojo work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Read only pojo with crud', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Read only pojo with crud' })).toBeVisible()

  await expect(page.getByTestId('action-component-0___assess')).toBeVisible()
  await expect(page.getByTestId('action-component-0___edit')).toBeVisible()

  await expect(page.getByText('Mateu').first()).toBeVisible()

  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})

  await page.getByTestId('action-component-0___edit').click()

  await expect(page.getByLabel('Name')).toBeVisible()

  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')

  await page.getByTestId('action-component-0___save').click()
  await expect(page.getByText('Saved')).toBeVisible()
  await expect(page.locator('h2', { hasText: 'Read only pojo with crud' })).toBeVisible()
  await expect(page.getByText('Antonia').first()).toBeVisible()

});

