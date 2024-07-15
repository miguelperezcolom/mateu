import { test, expect } from '@playwright/test';

test('miscellaneous work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Miscellaneous', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'This is a sample form' })).toBeVisible()

  await expect(page.getByRole('link', { name: 'https://www.google.es' })).toBeVisible()
  await expect(page.getByTestId('htmlWithLinks')).toContainText("Esto es un")
  await expect(page.getByTestId('htmlWithLinks').locator("a")).toBeVisible()
  await expect(page.getByTestId('htmlWithLinks').locator("a")).toHaveText("link")
  await expect(page.getByTestId('htmlWithLinks').locator("a")).toHaveAttribute("href", "https://www.google.es")


});

