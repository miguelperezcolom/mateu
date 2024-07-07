import { test, expect } from '@playwright/test';

test('read only pojo work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Read only pojo with crud', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Read only pojo with crud' })).toBeVisible()

  await expect(page.getByTestId('action-component-0___assess')).toBeVisible()
  await expect(page.getByTestId('action-component-0___edit')).toBeVisible()

  await expect(page.getByText('Mateu')).toBeVisible()
  await expect(page.getByText('20.31')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Assessment' })).toBeVisible()

  await expect(page.getByText('Mateu')).toHaveClass('cell value')

  await expect(page.getByRole('heading', { name: 'Programming languages' })).toBeVisible()
  await expect(page.getByText('This is the subtitle')).toBeVisible()
  await expect(page.getByLabel('Other save options').locator('svg')).toBeVisible()
  await expect(page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name')).toBeVisible()
  await expect(page.getByTestId('search')).toBeVisible()
  await expect(page.getByTestId('filters')).toBeVisible()
  await expect(page.getByTestId('clearfilters')).toBeVisible()
  await expect(page.getByText('Applied filters: None')).toBeVisible()
  await expect(page.getByText('0 elements found.')).toBeVisible()

  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Name' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Target' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Status' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Actions' })).toBeVisible()

  await expect(page.getByText('Page:')).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Export as ...' })).toBeVisible()


  await page.getByRole('menuitem', { name: 'Other save options' }).hover()
  await page.getByRole('option', { name: 'Add new language' }).click()
  await expect(page.locator('h2', { hasText: 'New language' })).toBeVisible()


});

