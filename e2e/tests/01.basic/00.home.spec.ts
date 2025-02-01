import { test, expect } from '@playwright/test';

test('hello is visible', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page.getByText('Whitelabel Error Page')).toBeVisible()
});
