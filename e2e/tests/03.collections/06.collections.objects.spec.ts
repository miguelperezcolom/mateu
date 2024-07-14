import { test, expect } from '@playwright/test';

test('objects work', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await page.getByRole('menuitem', { name: 'Collections' }).click()
  await page.getByRole('option', { name: 'Objects', exact: true }).click()
  await expect(page.locator('h2', { hasText: 'Objects' })).toBeVisible()


  await expect(page.getByTestId('profile')).toBeVisible()
  await expect(page.getByTestId('profile').getByText('Profile', { exact: true })).toBeVisible()
  await expect(page.getByTestId('profile').getByRole('button', { name: 'Edit' })).toBeVisible()
  await expect(page.getByTestId('profile').getByText('Profile(name=Mateu, age=14, favouriteMovie=JohnWick)'))
      .toBeVisible()

  await page.getByTestId('profile').getByRole('button', { name: 'Edit' }).click()
  await expect(page.locator('h2', { hasText: 'Profile' })).toBeVisible()
  await expect(page.getByLabel('Name')).toBeVisible()
  await expect(page.getByLabel('Name')).toHaveValue('Mateu')
  await expect(page.getByLabel('Age')).toBeVisible()
  await expect(page.getByLabel('Age')).toHaveValue('14')

  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.locator('h2', { hasText: 'Objects' })).toBeVisible()
  await expect(page.getByTestId('profile')).toBeVisible()
  await expect(page.getByTestId('profile').getByText('Profile(name=Mateu, age=14, favouriteMovie=JohnWick)'))
      .toBeVisible()

  await page.getByTestId('profile').getByRole('button', { name: 'Edit' }).click()
  await expect(page.locator('h2', { hasText: 'Profile' })).toBeVisible()
  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')
  await page.getByLabel('Age').clear()
  await page.getByLabel('Age').fill('48')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByTestId('profile').getByText('Profile(name=Mateu, age=14, favouriteMovie=JohnWick)'))
      .toBeVisible()
  await page.getByTestId('profile').getByRole('button', { name: 'Edit' }).click()
  await expect(page.locator('h2', { hasText: 'Profile' })).toBeVisible()
  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Antonia')
  await page.getByLabel('Age').clear()
  await page.getByLabel('Age').fill('48')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByTestId('profile').getByText('Profile(name=Antonia, age=48, favouriteMovie=JohnWick)'))
      .toBeVisible()

  await expect(page.getByTestId('emptyProfile')).toBeVisible()
  await expect(page.getByTestId('emptyProfile').getByText('Empty profile', { exact: true })).toBeVisible()
  await expect(page.getByTestId('emptyProfile').getByRole('button', { name: 'Edit' })).toBeVisible()
  await expect(page.getByTestId('emptyProfile').getByText('No value'))
      .toBeVisible()
  await page.getByTestId('emptyProfile').getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Name').clear()
  await page.getByLabel('Name').fill('Mateu')
  await page.getByLabel('Age').clear()
  await page.getByLabel('Age').fill('14')
  await page.getByLabel('Favourite movie').click()
  await page.getByRole('option', { name: 'JohnWick' }).click()
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByTestId('emptyProfile').getByText('Profile(name=Mateu, age=14, favouriteMovie=JohnWick)'))
      .toBeVisible()

});

