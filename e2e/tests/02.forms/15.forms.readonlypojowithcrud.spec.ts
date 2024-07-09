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
  await expect(page.getByText('5 elements found.')).toBeVisible()

  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Name' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Target' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Status' })).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Actions' })).toBeVisible()

  await expect(page.getByRole('menuitem', { name: 'Export as ...' })).toBeVisible()

  await expect(page.getByLabel('Other save options').locator('svg')).toBeVisible()
  await page.getByLabel('Other save options').locator('svg').click()
  await expect(page.getByRole('option', { name: 'Do something great, please' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Do something again, please' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Add new language' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Remove selected' })).toBeVisible()
  await page.getByLabel('Other save options').locator('svg').click()

  await expect(page.getByText('This is the subtitle')).toBeVisible()
  await expect(page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name')).toBeVisible()
  await expect(page.getByTestId('search')).toBeVisible()
  await expect(page.getByTestId('filters')).toBeVisible()
  await expect(page.getByTestId('clearfilters')).toBeVisible()
  await expect(page.getByText('Applied filters: None')).toBeVisible()

  await expect(page.locator('vaadin-grid-sorter').filter({ hasText: 'Name' })).toBeVisible()
  await expect(page.locator('vaadin-grid-sorter').filter({ hasText: 'Target' })).toBeVisible()
  await expect(page.locator('vaadin-grid-sorter').filter({ hasText: 'Status' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible()

  await expect(page.getByText('Java', {exact: true})).toBeVisible()
  await expect(page.getByText('Backend').first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Success' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: '···' }).first()).toBeVisible()
  await expect(page.getByTestId('edit-java')).toBeVisible()
  await expect(page.getByText('Javascript', {exact: true})).toBeVisible()
  await expect(page.getByText('C', {exact: true})).toBeVisible()
  await expect(page.getByText('C#', {exact: true})).toBeVisible()
  await expect(page.getByText('C++', {exact: true})).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Success' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Error' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Warning' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Info' }).first()).toBeVisible()
  await expect(page.getByText('elements found.')).toBeVisible()



  // some searchs

  await page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name').fill('javascript')
  await page.getByTestId('search').click()
  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('Javascript', {exact: true}).first()).toBeVisible()
  await expect(page.getByText('Frontend').first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Error' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: '···' }).first()).toBeVisible()
  await expect(page.getByTestId('edit-js').first()).toBeVisible()
  await expect(page.getByText('1 elements found.')).toBeVisible()

  await page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name').fill('c++')
  await page.getByTestId('search').click()
  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('C++', {exact: true}).first()).toBeVisible()
  await expect(page.getByText('Backend').first().first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: 'Info' }).first()).toBeVisible()
  await expect(page.locator('vaadin-grid-cell-content').filter({ hasText: '···' }).first()).toBeVisible()
  await expect(page.getByTestId('edit-c++').first()).toBeVisible()
  await expect(page.getByText('1 elements found.')).toBeVisible()

  await page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name').fill('java')
  await page.getByTestId('search').click()
  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('2 elements found.')).toBeVisible()
  await expect(page.getByText('Java', {exact: true})).toBeVisible()
  await expect(page.getByText('Javascript', {exact: true})).toBeVisible()

  // new

  await page.getByLabel('Other save options').locator('svg').click()
  await page.getByRole('option', { name: 'Add new language' }).click()
  await expect(page.locator('h2', { hasText: 'New language' })).toBeVisible()
  var uuid = await page.getByLabel('Id').innerText()
  await page.getByLabel('Name').fill('xxx')
  await page.getByLabel('Target').click()
  await page.getByRole('option', { name: 'Backend' }).click()
  await page.getByTestId('action-component-0___save').click()
  await page.getByTestId('action-nowto').click()

  await page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name').fill('x')
  await page.getByTestId('search').click()
  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('xxx', {exact: true}).first()).toBeVisible()
  await expect(page.getByText('1 elements found.')).toBeVisible()

  // edit

  await page.getByTestId('edit-' + uuid).click()
  await expect(page.getByRole('heading', { name: 'Xxx' })).toBeVisible()
  await page.getByTestId('action-component-0___edit').click()
  await page.getByLabel('Name').fill('yyy')
  await page.getByLabel('Target').click()
  await page.getByRole('option', { name: 'Frontend' }).click()
  await page.getByTestId('action-component-0___save').click()
  await page.getByTestId('action-nowto').click()
  //await page.getByRole('button', { name: 'Back' }).click()
  await page.getByTestId('filter-programmingLanguages-name').getByPlaceholder('Name').fill('y')
  await page.getByTestId('search').click()
  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('yyy', {exact: true}).first()).toBeVisible()
  await expect(page.getByText('1 elements found.')).toBeVisible()


  // remove

  await page.getByLabel('Select All').getByLabel('').click()
  await page.getByLabel('Other save options').locator('svg').click()
  await page.getByRole('option', { name: 'Remove selected' }).click()
  await page.getByTestId('dialog-confirm').click()
  await page.getByTestId('action-nowto').click()

  await expect(page.locator('.lds-roller')).toBeVisible({visible: false})
  await expect(page.getByText('yyy', {exact: true}).first()).toBeVisible({visible: false})
  await expect(page.getByText('0 elements found.')).toBeVisible()

});

