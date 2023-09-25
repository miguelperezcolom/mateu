import { test, expect } from '@playwright/test';

test('text fields work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Forms' }).click()
  await page.getByRole('option', { name: 'Text', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Text' })).toBeVisible()

  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveValue('Mateu')

  await expect(page.getByTestId('withPlaceholder').getByPlaceholder('This should appear as the placeholder')).toBeVisible()

  await expect(page.getByLabel('Text')).toHaveValue('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.\n' +
      '\n' +
      'Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.' +
      '\n')

  await page.getByTestId('action-component-0___assess').click()


  await expect(page.getByLabel('Assessment')).toHaveText('Mateunull, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.\n' +
      'Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.')

  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('Antonianull, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.\n' +
      'Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.')

  await page.getByLabel('With placeholder').clear()
  await page.getByLabel('With placeholder').fill('Hola')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('AntoniaHola, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.\n' +
      'Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.')

  await page.getByLabel('Text').clear()
  await page.getByLabel('Text').fill('Adios')

  await page.getByTestId('action-component-0___assess').click()
  await expect(page.getByLabel('Assessment')).toHaveText('AntoniaHola, Adios')
});
