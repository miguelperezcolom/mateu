// The six sample screens, converted from a Figma file (bin/run.mjs passes BASE_URL and FIXTURE),
// checked in a browser the way someone would use them: each renders with no error, the contact
// form refuses an incomplete Save and sends a complete one, the listing shows rows that open the
// record, the guided process moves between its steps, the welcome page's calls to action navigate.
import { test, expect } from '@playwright/test'

/** Fails the test on any console error, uncaught exception or failed request to the app. */
function watchErrors(page) {
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`exception: ${e.message}`))
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith(process.env.BASE_URL ?? '')) errors.push(`HTTP ${r.status()} ${r.url()}`)
  })
  return errors
}

const SCREENS = {
  welcome: ['Welcome to the gallery', 'Browse artworks', 'Opening hours', 'Find us'],
  contact: ['New contact', 'Contact details', 'Full name', 'Email', 'Country', 'Birth date', 'Membership', 'Send me the newsletter'],
  artworks: ['Artworks', 'The Starry Night', 'Gustav Klimt', 'Las Meninas'],
  'artworks/1': ['Artwork', 'The Starry Night', 'Vincent van Gogh', 'MoMA, New York', 'Details', 'Story', 'Oil on canvas'],
  dashboard: ['Gallery dashboard', 'Visitors', '12,480', 'Ticket sales', 'Most viewed', 'Notes'],
  onboarding: ['Join the gallery', 'Account', 'Preferences', 'Confirm', 'Full name'],
}

for (const [route, texts] of Object.entries(SCREENS)) {
  test(`${route} renders`, async ({ page }) => {
    const errors = watchErrors(page)
    await page.goto(`/${route}`)
    for (const t of texts) await expect(page.getByText(t, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/not found/i)).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('contact: Save is refused while a required field is empty, then sends the form', async ({ page, request }) => {
  const errors = watchErrors(page)
  const posts = []
  page.on('request', (r) => { if (r.method() === 'POST' && r.url().endsWith('/api/contacts')) posts.push(r.postData()) })
  await page.goto('/contact')
  await expect(page.getByText('Full name', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(/validation errors|required|cannot be empty/i).first()).toBeVisible()
  expect(posts).toEqual([])

  await page.getByRole('textbox', { name: 'Full name' }).fill('Ada Lovelace')
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.com')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Contact saved' })).toBeVisible()
  expect(posts.length).toBe(1)
  const saved = await (await request.get('/api/contacts')).json()
  expect(saved.at(-1)).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' })
  expect(errors).toEqual([])
})

test('contact: Cancel goes to the artworks listing', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page).toHaveURL(/\/artworks$/)
  await expect(page.getByText('The Kiss', { exact: true })).toBeVisible()
})

test('artworks: a row opens its record', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/artworks')
  await page.getByText('The Kiss', { exact: true }).click()
  await expect(page).toHaveURL(/\/artworks\/2$/)
  await expect(page.getByText('Belvedere, Vienna', { exact: true })).toBeVisible()
  await expect(page.getByText('Gustav Klimt', { exact: true }).first()).toBeVisible()
  expect(errors).toEqual([])
})

test('artworks: the search narrows the rows', async ({ page }) => {
  await page.goto('/artworks')
  await expect(page.getByText('Las Meninas', { exact: true })).toBeVisible()
  const search = page.getByRole('textbox').first()
  await search.fill('klimt')
  await search.press('Enter')
  // vaadin-grid keeps recycled rows in the DOM, hidden: count the visible ones
  await expect(page.getByText('Las Meninas', { exact: true }).filter({ visible: true })).toHaveCount(0)
  await expect(page.getByText('The Kiss', { exact: true }).filter({ visible: true })).toHaveCount(1)
})

test('artwork: the tabs switch', async ({ page }) => {
  await page.goto('/artworks/3')
  await expect(page.getByText('Oil on canvas', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Story' }).click()
  await expect(page.getByText(/this tab tells it/)).toBeVisible()
})

test('onboarding: the guided process moves between its steps', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('/onboarding')
  await page.getByRole('textbox', { name: 'Full name' }).fill('Grace Hopper')
  await page.getByRole('tab', { name: 'Preferences' }).click()
  await expect(page.getByText('Guided tours', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Confirm' }).click()
  await expect(page.getByText('Press Finish to become a member.')).toBeVisible()
  await page.getByRole('tab', { name: 'Account' }).click()
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Grace Hopper')
  expect(errors).toEqual([])
})

test('welcome: the calls to action navigate', async ({ page }) => {
  await page.goto('/welcome')
  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Gallery dashboard' })).toBeVisible()
  await page.goto('/welcome')
  await page.getByRole('button', { name: 'Browse artworks' }).click()
  await expect(page).toHaveURL(/\/artworks$/)
  await expect(page.getByText('The Starry Night', { exact: true }).filter({ visible: true })).toHaveCount(1)
})
