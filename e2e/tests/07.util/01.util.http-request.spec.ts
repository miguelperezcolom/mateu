import { test, expect } from '@playwright/test';

test('objects work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Util' }).click()
  await page.getByRole('option', { name: 'Http request', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Servlet http request form' })).toBeVisible()
  await expect(page.getByTestId('rq').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Read request' })).toBeVisible()

  await page.getByRole('button', { name: 'Read request' }).click()
  await expect(page.getByTestId('rq').first()).toContainText('/mateu/v2/journeys/util_httpRequest/')
  await expect(page.getByTestId('rq').first()).toContainText('/steps/form/component-0___readRequest')

});

