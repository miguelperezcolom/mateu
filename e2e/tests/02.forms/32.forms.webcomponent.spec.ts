import { test, expect } from '@playwright/test';

test('web component work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Web component', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Web component' })).toBeVisible()

  await expect(page.locator('model-viewer')).toBeVisible()
  await expect(page.locator('model-viewer')).toHaveAttribute('src', '/myassets/NeilArmstrong.glb')
  await expect(page.locator('model-viewer')).toHaveAttribute('auto-rotate', 'auto-rotate')

});

