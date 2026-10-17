import { test, expect, Page } from '@playwright/test';

/**
 * Renderer-agnostic actions walkthrough (design/walkthrough/actions.md): what an action can return
 * and how it is triggered, asserted by ROLES, accessible names and visible text only — so the same
 * file runs against Vaadin (renderer-vaadin) and VB/Redwood (renderer-vb). The Vaadin-only details
 * (drawer header extras, nested overlays, island scopes) live in tests/shared/*-lab.spec.ts.
 * Fixtures: e2e/sut/modules/sample1/.../actions/*.
 */

const box = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true })
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const text = (page: Page, t: string | RegExp) => page.getByText(t).first()

const unhandledOf = (page: Page) => {
  const unhandled: string[] = []
  page.on('console', m => {
    if (m.text().includes('no component on the page handles it')) unhandled.push(m.text())
  })
  return unhandled
}

async function open(page: Page, route: string, heading: string) {
  await page.goto(route)
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 20000 })
}

test.describe('actions: triggering and returning (any renderer)', () => {

  test('a button runs its method and the toast shows', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await open(page, '/actions-lab', 'Actions lab')
    await box(page, 'Name').fill('Ada')
    await btn(page, 'Greet').click()
    await expect(text(page, 'Hello Ada!')).toBeVisible()
    expect(unhandled).toEqual([])
  })

  test('an action returning this updates the fields on screen', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Count').click()
    await expect(box(page, 'Outcome')).toHaveValue('counted 1')
  })

  test('a confirmation is asked before the action runs', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Danger').click()
    await expect(text(page, 'This is the danger zone')).toBeVisible()
    await btn(page, 'Do it').click()
    await expect(box(page, 'Outcome')).toHaveValue('danger done')
  })

  test('a keyboard shortcut runs the action', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await box(page, 'Name').click()
    await page.keyboard.press('Control+Alt+KeyK')
    await expect(text(page, 'Shortcut ran')).toBeVisible()
  })

  test('a returned URI navigates', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Go to counter').click()
    await expect(page).toHaveURL(/\/fluent-counter$/)
  })

  test('the new state and a toast in one answer both arrive; Undo runs the undo action', async ({ page }) => {
    const unhandled = unhandledOf(page)
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Delete with undo').click()
    await expect(box(page, 'Outcome')).toHaveValue('deleted')
    await page.getByRole('button', { name: /undo|deshacer/i }).first().click()
    await expect(box(page, 'Outcome')).toHaveValue('restored 7')
    expect(unhandled).toEqual([])
  })

  test('banners returned by actions show and accumulate', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Banner').click()
    await expect(text(page, 'Checks passed')).toBeVisible()
    await btn(page, 'Append banner').click()
    await expect(text(page, 'Appended 1')).toBeVisible()
  })

  test('a user-facing error shows as written, any other one generically with a reference', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'User error').click()
    await expect(text(page, 'You cannot do that here')).toBeVisible()
    await btn(page, 'Crash').click()
    await expect(text(page, /Reference: \S+/)).toBeVisible()
    await expect(page.getByText('internal detail that must not leak')).toHaveCount(0)
  })

  test('another object returned renders as the next view', async ({ page }) => {
    await open(page, '/actions-lab', 'Actions lab')
    await btn(page, 'Open another view').click()
    await expect(page.getByRole('heading', { name: 'Returned view' }).first()).toBeVisible()
  })
})

test.describe('triggers (any renderer)', () => {

  test('OnLoad, OnSuccess and OnCustomEvent run their actions', async ({ page }) => {
    await open(page, '/triggers-lab', 'Triggers lab')
    await expect(box(page, 'On load')).toHaveValue('loaded')
    await btn(page, 'Ok').click()
    await expect(box(page, 'On success')).toHaveValue('after ok')
    await btn(page, 'Emit').click()
    await expect(box(page, 'On custom')).toHaveValue('custom heard')
  })

  test('OnError runs after a failing action', async ({ page }) => {
    await open(page, '/triggers-lab', 'Triggers lab')
    await btn(page, 'Fail').click()
    await expect(box(page, 'On error')).toHaveValue('after fail')
    // …and not its OnSuccess
    await page.waitForTimeout(500)
    await expect(box(page, 'On success')).toHaveValue('')
  })
})

test.describe('event bus and value triggers (any renderer)', () => {

  test('@SubscribeTo: DOCUMENT hears any island, COMPONENT only its source, SELF what bubbles up', async ({ page }) => {
    // VB used to paint a form page through its generic form and dropped the component-holder
    // fields holding islands; they are inline islands now (surfaces of their own, poc/transport.mjs)
    await open(page, '/events-lab', 'Events lab')
    await expect(text(page, 'Listener heard nothing (0)')).toBeVisible()
    await btn(page, 'Ping B').click()
    await expect(box(page, 'Heard by page')).toHaveValue('ping from B')
    await expect(text(page, 'Listener heard nothing (0)')).toBeVisible()
    await btn(page, 'Ping A').click()
    await expect(text(page, 'Listener heard from A (1)')).toBeVisible()
    await btn(page, 'Child ping A').click()
    await expect(box(page, 'Heard from child')).toHaveValue('child ping from A')
  })

  test('OnValueChange runs when the watched field changes', async ({ page }) => {
    await open(page, '/triggers-lab', 'Triggers lab')
    await expect(box(page, 'On load')).toHaveValue('loaded')
    await box(page, 'Watched').fill('abc')
    await box(page, 'Watched').blur()
    await expect(box(page, 'On value change')).toHaveValue('changed to abc')
  })

  test('@AutoSave runs once the user stops typing', async ({ page }) => {
    await open(page, '/autosave-lab', 'Autosave lab')
    await box(page, 'Draft').pressSequentially('hello', { delay: 30 })
    await box(page, 'Draft').blur()
    await expect(box(page, 'Saved')).toHaveValue(/^saved 'hello' \(\d+\)$/)
  })
})

test.describe('overlays (any renderer)', () => {

  test('a dialog opened from a drawer closes alone, leaving the drawer open', async ({ page }) => {
    // on VB the dialog used to take the drawer's place in the overlay stack (both carry the filler
    // id `fieldId`) and the drawer panel closed under the modal: two overlays, two variables now
    await open(page, '/overlay-lab', 'Overlay lab')
    await btn(page, 'Edit contact').click()
    await btn(page, 'Open nested dialog').click()
    await expect(text(page, 'Inner dialog')).toBeVisible()
    await page.getByRole('dialog', { name: 'Nested dialog' }).getByRole('button', { name: 'Close inner' }).click()
    await expect(page.getByText('Inner dialog')).toBeHidden()
    await expect(btn(page, 'Save contact')).toBeVisible()
  })

  test('a drawer closes with a result the page receives', async ({ page }) => {
    await open(page, '/overlay-lab', 'Overlay lab')
    await btn(page, 'Edit contact').click()
    await box(page, 'Contact name').fill('Linus')
    await btn(page, 'Save contact').click()
    await expect(box(page, 'Received')).toHaveValue('saved Linus')
  })

  test('a confirm dialog runs the picked button', async ({ page }) => {
    await open(page, '/overlay-lab', 'Overlay lab')
    await btn(page, 'Confirm dialog').click()
    await btn(page, 'Yes').click()
    await expect(box(page, 'Received')).toHaveValue('confirmed')
  })
})
