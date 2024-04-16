import { test, expect } from '@playwright/test';

test('read only pojo work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Read only pojo', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Read only pojo' })).toBeVisible()

  await expect(page.getByTestId('action-component-0___assess')).toBeVisible()
  await expect(page.getByTestId('action-component-0___edit')).toBeVisible()

  await expect(page.getByText('Mateu')).toBeVisible()
  await expect(page.getByText('20.31')).toBeVisible()
  await expect(page.getByText('Lorem ipsum')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dates' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Checks' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Enums' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment' })).toBeVisible()

  await expect(page.getByText('Mateu')).toHaveClass('cell value')

});

