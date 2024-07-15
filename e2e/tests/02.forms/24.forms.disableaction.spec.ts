import { test, expect } from '@playwright/test';

test('diable action work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Disable action', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Disable action' })).toBeVisible()

  await expect(page.getByTestId('action-component-0___activate')).toBeEnabled()
  await expect(page.getByTestId('action-component-0___deactivate')).toBeEnabled({enabled: false})
  page.getByTestId('action-component-0___activate').click()
  await expect(page.getByTestId('action-component-0___activate')).toBeEnabled({enabled: false})
  await expect(page.getByTestId('action-component-0___deactivate')).toBeEnabled()
  page.getByTestId('action-component-0___deactivate').click()
  await expect(page.getByTestId('action-component-0___activate')).toBeEnabled()
  await expect(page.getByTestId('action-component-0___deactivate')).toBeEnabled({enabled: false})

});

