import { test, expect } from '@playwright/test';

test('hello is visible', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page.getByText('Hello!')).toBeVisible()
  await expect(page.getByText('This is some content for the home page.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Demo app' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
});
