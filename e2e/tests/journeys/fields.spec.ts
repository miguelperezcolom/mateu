import { test, expect } from '@playwright/test';

/**
 * Field kinds the shared suite does not walk (fixture JFieldsForm, /j/fields in mvc-app1): a tab
 * strip that opens on the tab marked `@Tab(open = true)`, a `@BulletedList`, `@SeparatorBefore`, a
 * `@Notice` whose text is the field's value, and `@PhotoCapture` taking a REAL frame — the
 * `journeys` project launches Chromium with a fake camera, so the getUserMedia path runs headless.
 */

test.describe('fields (/j/fields)', () => {

  test('the tab marked open is the one selected on first render, and the others still switch', async ({ page }) => {
    await page.goto('/j/fields')
    await expect(page.getByRole('tab', { name: 'Preferences' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel', { name: 'Preferences' })).toBeVisible()
    await page.getByRole('tab', { name: 'Guest' }).click()
    await expect(page.getByRole('textbox', { name: 'Guest name' })).toHaveValue('Ada')
  })

  test('a bulleted list renders each item, and the notice shows the field value', async ({ page }) => {
    await page.goto('/j/fields')
    const panel = page.getByRole('tabpanel', { name: 'Preferences' })
    await expect(panel.getByRole('list').getByRole('listitem')).toHaveText(['Quiet room', 'Late check-out', 'No feathers'])
    await expect(panel.getByText('2 pending complaints')).toBeVisible()
  })

  test('@SeparatorBefore paints a separator between two fields', async ({ page }) => {
    await page.goto('/j/fields')
    await expect(page.getByRole('separator')).toHaveCount(1)
    // between Booking and Desk, in reading order
    await expect(page.getByRole('region').first()).toMatchAriaSnapshot(`
      - textbox "Booking"
      - separator
      - text: Desk
    `)
  })

  // Inside a @Tab too: the tab path (TabFormLayoutBuilder) used to drop the Separator.
  test('@SeparatorBefore inside a tab paints a separator too', async ({ page }) => {
    await page.goto('/j/fields')
    await page.getByRole('tab', { name: 'Guest' }).click()
    await expect(page.getByRole('tabpanel', { name: 'Guest' }).getByRole('separator')).toHaveCount(1)
  })

  test('@PhotoCapture takes a photo with the camera and the form sends it as a JPEG data URI', async ({ page }) => {
    await page.goto('/j/fields')
    await page.getByRole('tab', { name: 'Photo' }).click()
    await page.getByRole('button', { name: 'Take photo' }).click()
    // the live preview: a real stream from the (fake) camera
    await expect.poll(() => page.locator('mateu-camera-capture video').evaluate(v => (v as HTMLVideoElement).videoWidth)).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Capture' }).click()
    await expect(page.locator('mateu-camera-capture img')).toHaveAttribute('src', /^data:image\/jpeg;base64,/)

    await page.getByRole('button', { name: 'Describe' }).click()
    await expect(page.getByText('guest=Ada; photo=data:image/jpe').first()).toBeVisible()
  })

  test('Cancel closes the camera without changing the value', async ({ page }) => {
    await page.goto('/j/fields')
    await page.getByRole('tab', { name: 'Photo' }).click()
    await page.getByRole('button', { name: 'Take photo' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Take photo' })).toBeVisible()
    await page.getByRole('button', { name: 'Describe' }).click()
    await expect(page.getByText('guest=Ada; photo=none').first()).toBeVisible()
  })
})
