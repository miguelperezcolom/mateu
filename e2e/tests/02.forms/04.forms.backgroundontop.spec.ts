import { test, expect } from '@playwright/test';

test('has background on top', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Background on top', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Background on top' })).toBeVisible()


  await expect(page.locator('vaadin-vertical-layout > div').first()).toHaveCSS('background-image', /background\.svg/)

});
