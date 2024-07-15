import { test, expect } from '@playwright/test';

test('remote form work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Remote form', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Pattern' })).toBeVisible()

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByRole('alert').getByText('Several fields have errors')).toBeVisible()

  await page.getByTestId('zipCode').getByPlaceholder('[0-9]*').click()
  await page.keyboard.press('s');
  await page.keyboard.press('a');
  await page.keyboard.press('x');
  await page.keyboard.press('1');
  await page.keyboard.press('2');
  await page.keyboard.press('3');
  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('123')
});

