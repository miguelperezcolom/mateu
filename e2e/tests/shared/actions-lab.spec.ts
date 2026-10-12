import { test, expect, Page } from '@playwright/test';

// The actions walkthrough (design/walkthrough/actions.md), driven from a real browser on every
// adapter: each test is one way an action is triggered or one thing it returns, asserted by what
// the USER sees — not by the wire. Fixtures: e2e/sut/modules/sample1/.../actions/*.

const unhandledOf = (page: Page) => {
  const unhandled: string[] = []
  page.on('console', m => {
    if (m.text().includes('no component on the page handles it')) unhandled.push(m.text())
  })
  return unhandled
}

const field = (page: Page, id: string) => page.locator(`#${id} input`).first()
// a toast is announced twice by design (live region + card): pin to the first match
const toast = (page: Page, text: string | RegExp) => page.getByText(text).first()

async function open(page: Page, route: string, title: string) {
  await page.goto(route)
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible()
}

test.describe('Actions lab (/actions-lab) — triggering', () => {

  test('a @Button method runs and its Message shows as a toast', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await open(page, '/actions-lab', 'Actions lab')
    await field(page, 'name').fill('Ada')
    await page.getByRole('button', { name: 'Greet', exact: true }).click()
    await expect(toast(page, 'Hello Ada!')).toBeVisible()
    expect(unhandled).toEqual([])
  })

  test('a @Toolbar method returning this updates the page state', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Count', exact: true }).click()
    await expect(field(page, 'outcome')).toHaveValue('counted 1')
    await page.getByRole('button', { name: 'Count', exact: true }).click()
    await expect(field(page, 'outcome')).toHaveValue('counted 2')
  })

  test('@Action(shortcut) runs from the keyboard', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await field(page, 'name').click()
    await page.keyboard.press('Control+Alt+KeyK')
    await expect(toast(page, 'Shortcut ran')).toBeVisible()
  })

  test('@Action(confirmationRequired) asks first, with the declared texts', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Danger' }).click()
    await expect(page.getByText('This is the danger zone').first()).toBeVisible()
    await page.getByRole('button', { name: 'Keep it' }).click()
    await expect(field(page, 'outcome')).toHaveValue('')

    await page.getByRole('button', { name: 'Danger' }).click()
    await page.getByRole('button', { name: 'Do it' }).click()
    await expect(field(page, 'outcome')).toHaveValue('danger done')
  })
})

test.describe('Actions lab (/actions-lab) — return values', () => {

  test('a URI navigates', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Go to counter' }).click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
    await expect(page.getByText('Count: 0')).toBeVisible()
  })

  test('UICommand.navigateTo navigates', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Navigate command' }).click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
  })

  test('another object renders as the next view', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Open another view' }).click()
    await expect(page.getByRole('heading', { name: 'Returned view' }).first()).toBeVisible()
    await expect(page.getByText('from the lab').first()).toBeVisible()
  })

  test('an undoable Message offers Undo, which runs the undo action with its parameters', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Delete with undo' }).click()
    await expect(toast(page, 'Item 7 deleted')).toBeVisible()
    await expect(field(page, 'outcome')).toHaveValue('deleted')
    await page.getByRole('button', { name: /undo|deshacer/i }).first().click()
    await expect(field(page, 'outcome')).toHaveValue('restored 7')
    expect(unhandled).toEqual([])
  })

  test('a PageBanner shows on the page; PageBanners.append accumulates', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Banner', exact: true }).click()
    await expect(page.getByText('Checks passed')).toBeVisible()
    await page.getByRole('button', { name: 'Append banner' }).click()
    await page.getByRole('button', { name: 'Append banner' }).click()
    await expect(page.getByText('Checks passed')).toBeVisible()
    await expect(page.getByText('Appended 1')).toBeVisible()
    await expect(page.getByText('Appended 2')).toBeVisible()
  })

  test('a list mixing the new state and a command applies both', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    const heard = page.evaluate(() => new Promise<unknown>(resolve =>
      document.addEventListener('lab-event', e => resolve((e as CustomEvent).detail), { once: true })))
    await page.getByRole('button', { name: 'State and event' }).click()
    await expect(field(page, 'outcome')).toHaveValue('state+event 1')
    expect(await heard).toMatchObject({ n: 1 })
  })

  test('announce / announceAssertive reach the live regions; pushStateToHistory changes the URL', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Commands' }).click()
    await expect(page).toHaveURL(/\/actions-lab\?pushed=1$/)
    await expect.poll(() => page.evaluate(() =>
      [...document.querySelectorAll('[aria-live]')].map(e => e.textContent).join('|')))
      .toMatch(/Announced politely/)
    await expect.poll(() => page.evaluate(() =>
      [...document.querySelectorAll('[aria-live]')].map(e => e.textContent).join('|')))
      .toMatch(/Announced assertively/)
  })

  test('UICommand.runAction runs another action', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await field(page, 'name').fill('Grace')
    await page.getByRole('button', { name: 'Run greet' }).click()
    await expect(toast(page, 'Hello Grace!')).toBeVisible()
  })

  test('markAsDirty arms the leave guard and markAsClean disarms it', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    const flags = page.evaluate(() => {
      (window as any).__d = 0; (window as any).__c = 0
      document.addEventListener('dirty', () => (window as any).__d++)
      document.addEventListener('clean', () => (window as any).__c++)
    })
    await flags
    await page.getByRole('button', { name: 'Mark dirty' }).click()
    await expect.poll(() => page.evaluate(() => (window as any).__d)).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Mark clean' }).click()
    await expect.poll(() => page.evaluate(() => (window as any).__c)).toBeGreaterThan(0)
  })

  test('UICommand.downloadFile downloads the file', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download' }).click()
    expect((await download).suggestedFilename()).toBe('hello.txt')
  })
})

test.describe('Menus that run actions (/action-menu-app)', () => {

  test('a rule leaf runs the app action and the page under it stays', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await page.goto('/action-menu-app')
    await page.getByText('Ping server').first().click()
    await expect(toast(page, 'Pong from the menu')).toBeVisible()
    await expect(page).toHaveURL(/\/action-menu-app/)
    expect(unhandled).toEqual([])
  })
})

test.describe('Session expiry', () => {

  test('a 401 asks the app to re-authenticate and the retry completes the action', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    // the app's re-auth flow: claim the event, then retry
    await page.evaluate(() => document.addEventListener('mateu-session-expired', (e) => {
      e.preventDefault()
      ;(window as any).__expired = ((window as any).__expired ?? 0) + 1
      setTimeout(() => (e as CustomEvent).detail.retry(), 50)
    }))
    let first = true
    await page.route('**/mateu/v3/**', route => {
      if (first && (route.request().postData() ?? '').includes('"actionId":"greet"')) {
        first = false
        return route.fulfill({ status: 401, body: '' })
      }
      return route.continue()
    })
    await field(page, 'name').fill('Bob')
    await page.getByRole('button', { name: 'Greet', exact: true }).click()
    await expect(toast(page, 'Hello Bob!')).toBeVisible()
    expect(await page.evaluate(() => (window as any).__expired)).toBe(1)
  })
})

test.describe('Actions lab (/actions-lab) — failures', () => {

  test('a UserFacingException shows its title and message as written', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'User error' }).click()
    await expect(toast(page, 'You cannot do that here')).toBeVisible()
  })

  test('any other exception shows the generic text and a reference, never the internals', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Crash' }).click()
    await expect(toast(page, /An unexpected error occurred\. Reference: \S+/)).toBeVisible()
    await expect(page.getByText('internal detail that must not leak')).toHaveCount(0)
  })

  test('@Action(timeoutMillis) gives up on a slow server with a plain-language message', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await page.getByRole('button', { name: 'Too slow' }).click()
    await expect(toast(page, /took too long|timed out|too long/i)).toBeVisible({ timeout: 4000 })
  })
})
