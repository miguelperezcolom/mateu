import { test, expect } from '@playwright/test';

test('hide action work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Hide action', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Hide action' })).toBeVisible()

  await expect(page.getByTestId('action-component-0___activate')).toBeVisible()
  await expect(page.getByTestId('action-component-0___deactivate')).toBeVisible({visible: false})
  page.getByTestId('action-component-0___activate').click()
  await expect(page.getByTestId('action-component-0___activate')).toBeVisible({visible: false})
  await expect(page.getByTestId('action-component-0___deactivate')).toBeVisible()
  page.getByTestId('action-component-0___deactivate').click()
  await expect(page.getByTestId('action-component-0___activate')).toBeVisible()
  await expect(page.getByTestId('action-component-0___deactivate')).toBeVisible({visible: false})

});

