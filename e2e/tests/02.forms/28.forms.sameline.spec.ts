import { test, expect } from '@playwright/test';

test('fields are showed in same line', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Same line', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Same line' })).toBeVisible()

  await expect(page.locator('vaadin-horizontal-layout[class="line"]').nth(0).getByLabel('Name')).toBeVisible()
  await expect(page.locator('vaadin-horizontal-layout[class="line"]').nth(0).getByLabel('Age')).toBeVisible()

  await expect(page.locator('vaadin-horizontal-layout[class="line"]').nth(1).getByLabel('New line')).toBeVisible()
  await expect(page.locator('vaadin-horizontal-layout[class="line"]').nth(1).getByLabel('Same line', {exact: true})).toBeVisible()
  await expect(page.locator('vaadin-horizontal-layout[class="line"]').nth(1).getByLabel('Same line again')).toBeVisible()

});

