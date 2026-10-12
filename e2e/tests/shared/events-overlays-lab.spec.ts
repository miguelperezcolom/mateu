import { test, expect, Page } from '@playwright/test';

// The actions walkthrough, part two (design/walkthrough/actions.md): the event bus, triggers,
// overlays and component-named action ids, driven from a real browser on every adapter.

const unhandledOf = (page: Page) => {
  const unhandled: string[] = []
  page.on('console', m => {
    if (m.text().includes('no component on the page handles it')) unhandled.push(m.text())
  })
  return unhandled
}

const field = (page: Page, id: string) => page.locator(`#${id} input`).first()

test.describe('Events lab (/events-lab) — @SubscribeTo scopes', () => {

  test('DOCUMENT: the page hears an event emitted by any island', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await page.goto('/events-lab')
    await page.getByRole('button', { name: 'Ping B' }).click()
    await expect(field(page, 'heardByPage')).toHaveValue('ping from B')
    await page.getByRole('button', { name: 'Ping A', exact: true }).click()
    await expect(field(page, 'heardByPage')).toHaveValue('ping from A')
    expect(unhandled).toEqual([])
  })

  test('COMPONENT: a subscriber filtered by source only hears that emitter', async ({ page }) => {
    await page.goto('/events-lab')
    await expect(page.getByText('Listener heard nothing (0)')).toBeVisible()
    await page.getByRole('button', { name: 'Ping B' }).click()
    await expect(field(page, 'heardByPage')).toHaveValue('ping from B')
    await expect(page.getByText('Listener heard nothing (0)')).toBeVisible()
    await page.getByRole('button', { name: 'Ping A', exact: true }).click()
    await expect(page.getByText('Listener heard from A (1)')).toBeVisible()
  })

  test('SELF: an event bubbling up from an island inside the page reaches it', async ({ page }) => {
    await page.goto('/events-lab')
    await page.getByRole('button', { name: 'Child ping A' }).click()
    await expect(field(page, 'heardFromChild')).toHaveValue('child ping from A')
  })
})

test.describe('Triggers lab (/triggers-lab)', () => {

  test('OnLoad runs on opening — once, although its action re-renders the view', async ({ page }) => {
    // `loaded` returns `this`: the re-render used to fire OnLoad again, and again, until the
    // request-loop guard stopped it — `times` (1 by default) counted per render
    const loads: string[] = []
    page.on('request', r => {
      if (r.method() === 'POST' && (r.postData() ?? '').includes('"actionId":"loaded"')) loads.push(r.url())
    })
    await page.goto('/triggers-lab')
    await expect(field(page, 'onLoad')).toHaveValue('loaded')
    await page.waitForTimeout(1000)
    expect(loads).toHaveLength(1)
  })

  test('OnValueChange runs when the watched field changes', async ({ page }) => {
    await page.goto('/triggers-lab')
    await expect(field(page, 'onLoad')).toHaveValue('loaded')
    await field(page, 'watched').fill('abc')
    await field(page, 'watched').blur()
    await expect(field(page, 'onValueChange')).toHaveValue('changed to abc')
  })

  test('OnSuccess runs after the called action succeeds', async ({ page }) => {
    await page.goto('/triggers-lab')
    await expect(field(page, 'onLoad')).toHaveValue('loaded')
    await page.getByRole('button', { name: 'Ok', exact: true }).click()
    await expect(field(page, 'onSuccess')).toHaveValue('after ok')
  })

  test('OnError runs after the called action fails', async ({ page }) => {
    await page.goto('/triggers-lab')
    await expect(field(page, 'onLoad')).toHaveValue('loaded')
    await page.getByRole('button', { name: 'Fail', exact: true }).click()
    await expect(field(page, 'onError')).toHaveValue('after fail')
  })

  test('OnCustomEvent runs when the event is dispatched', async ({ page }) => {
    await page.goto('/triggers-lab')
    await expect(field(page, 'onLoad')).toHaveValue('loaded')
    await page.getByRole('button', { name: 'Emit', exact: true }).click()
    await expect(field(page, 'onCustom')).toHaveValue('custom heard')
  })
})

test.describe('Autosave lab (/autosave-lab)', () => {

  test('@AutoSave runs the action once the user stops typing', async ({ page }) => {
    await page.goto('/autosave-lab')
    await field(page, 'draft').pressSequentially('hello', { delay: 30 })
    await expect(field(page, 'saved')).toHaveValue(/^saved 'hello' \(\d+\)$/)
  })
})

test.describe('Overlay lab (/overlay-lab)', () => {

  test('a drawer closes with a result the page receives through @SubscribeTo', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Edit contact' }).click()
    const drawer = page.locator('mateu-drawer')
    await expect(drawer.getByText('Changes go back to the page')).toBeVisible()
    await drawer.locator('#contactName input').fill('Linus')
    await drawer.getByRole('button', { name: 'Save contact' }).click()
    await expect(field(page, 'received')).toHaveValue('saved Linus')
    await expect(page.locator('mateu-drawer')).toHaveCount(0)
    expect(unhandled).toEqual([])
  })

  test('a dialog opened from a drawer closes alone, leaving the drawer open', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Edit contact' }).click()
    await page.getByRole('button', { name: 'Open nested dialog' }).click()
    await expect(page.getByText('Inner dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Close inner' }).click()
    await expect(page.getByText('Inner dialog')).toHaveCount(0)
    await expect(page.locator('mateu-drawer').getByRole('button', { name: 'Save contact' })).toBeVisible()
  })

  test('Escape closes only the topmost overlay', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Edit contact' }).click()
    await page.getByRole('button', { name: 'Open nested dialog' }).click()
    await expect(page.getByText('Inner dialog')).toBeVisible()
    // with the focus OUTSIDE the dialog (it had not moved in yet): the drawer under it used to
    // close instead, leaving the dialog open over nothing
    await page.evaluate(() => {
      let el: Element | null = document.activeElement
      while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
      ;(el as HTMLElement | null)?.blur()
    })
    await page.keyboard.press('Escape')
    await expect(page.getByText('Inner dialog')).toHaveCount(0)
    await expect(page.locator('mateu-drawer').getByRole('button', { name: 'Save contact' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('mateu-drawer')).toHaveCount(0)
  })

  test('the drawer header carries maximize and peer navigation', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Edit contact' }).click()
    const drawer = page.locator('mateu-drawer')
    const panel = drawer.locator('[role="dialog"]')
    const before = (await panel.boundingBox())!.width
    await drawer.getByRole('button', { name: /maximi[sz]e/i }).click()
    await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(before)
    await drawer.getByRole('button', { name: /next/i }).click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
  })

  test('a bottom drawer collapses and expands', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Bottom drawer' }).click()
    const drawer = page.locator('mateu-drawer')
    await expect(drawer.getByText('Docked at the bottom')).toBeVisible()
    await drawer.getByRole('button', { name: /collapse/i }).click()
    await expect(drawer.getByText('Docked at the bottom')).toBeHidden()
    await drawer.getByRole('button', { name: /expand/i }).click()
    await expect(drawer.getByText('Docked at the bottom')).toBeVisible()
  })

  test('a modeless drawer leaves the page behind usable', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Modeless drawer' }).click()
    await expect(page.getByText('The page behind stays usable')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm dialog' }).click()
    await expect(page.getByText('Pick one')).toBeVisible()
  })

  test('a ConfirmDialog runs the action of the button the user picks', async ({ page }) => {
    await page.goto('/overlay-lab')
    await page.getByRole('button', { name: 'Confirm dialog' }).click()
    await page.getByRole('button', { name: 'No', exact: true }).click()
    await expect(field(page, 'received')).toHaveValue('rejected')
    await page.getByRole('button', { name: 'Confirm dialog' }).click()
    await page.getByRole('button', { name: 'Yes', exact: true }).click()
    await expect(field(page, 'received')).toHaveValue('confirmed')
  })
})

test.describe('Fluent actions lab (/fluent-actions-lab) — ids named by components', () => {

  for (const [what, click] of [
    ['card', (p: Page) => p.getByRole('button', { name: 'In a card' }).click()],
    ['tab', (p: Page) => p.getByRole('button', { name: 'In a tab' }).click()],
    ['metric', (p: Page) => p.getByText('Open orders').click()],
    ['empty state', (p: Page) => p.getByRole('button', { name: 'Create one' }).click()],
    ['notice', (p: Page) => p.getByRole('button', { name: 'Review' }).click()],
  ] as const) {
    test(`a ${what} action id reaches its method`, async ({ page }) => {
      const unhandled = unhandledOf(page)
      await page.goto('/fluent-actions-lab')
      await expect(page.getByText('Last: none')).toBeVisible()
      await click(page)
      await expect(page.getByText(`Last: ${what}`)).toBeVisible()
      expect(unhandled).toEqual([])
    })
  }
})
