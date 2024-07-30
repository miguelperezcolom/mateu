import { test, expect } from '@playwright/test';

test('init method is called', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Has init method', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Has init method' })).toBeVisible()

  await expect(page.getByText('/mateu/v1/com.example.demo.infra.ui.Home/journeys/forms_hasInitMethod')).toBeVisible()

});
