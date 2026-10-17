import { test, expect, Page } from '@playwright/test';
import { gridRows, posts, resetFixtures } from './_support';

/**
 * The CRUD journey a user walks: create and edit in a drawer over the listing (`editInDrawer`),
 * "Save and next" through the rows, the optimistic-lock conflict (`@Version`) seen by two users at
 * once, and inline editing of a table (`@InlineEditing` → `update-row`) that persists per cell.
 * Fixtures (mvc-app1): JTasksCrud (/j/tasks, drawer), JArticlesCrud (/j/articles, routed editor,
 * @Version), JStockCrud (/j/stock, inline); all reset before each test.
 */

test.describe.configure({ mode: 'serial' })
test.beforeEach(async ({ request }) => { await resetFixtures(request) })

const drawer = (page: Page) => page.getByRole('dialog')
const rowsOf = async (page: Page) => (await gridRows(page)).map(cells => cells.filter(Boolean).join(' | '))

test.describe('create and edit in a drawer (/j/tasks)', () => {

  test('New opens the form over the listing; Save closes it and the listing shows the row, without navigating', async ({ page }) => {
    await page.goto('/j/tasks')
    await expect.poll(() => rowsOf(page)).toHaveLength(3)
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await expect(drawer(page)).toBeVisible()
    await expect(page).toHaveURL(/\/j\/tasks$/)
    // the listing stays behind the drawer
    await expect(page.getByRole('treegrid')).toBeAttached()

    await drawer(page).getByRole('textbox', { name: 'Title' }).fill('Pack the boxes')
    await drawer(page).getByRole('spinbutton', { name: 'Hours' }).fill('4')
    await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()

    await expect(drawer(page)).toHaveCount(0)
    await expect(page).toHaveURL(/\/j\/tasks$/)
    await expect.poll(() => rowsOf(page)).toContain('T-04 | Pack the boxes | 4 | 0')
  })

  test('a required field keeps the drawer open and tells what is missing', async ({ page }) => {
    await page.goto('/j/tasks')
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()
    await expect(drawer(page)).toBeVisible()
    // the server's check refuses it and the drawer says why, keeping what was typed
    await expect(drawer(page).getByText('Title: Cannot be empty')).toBeVisible()
    await expect(drawer(page).getByRole('spinbutton', { name: 'Hours' })).toBeVisible()
    await expect.poll(() => rowsOf(page)).toHaveLength(3)
  })

  test('a row opens its record in the drawer; Save and next saves it and moves to the next row', async ({ page }) => {
    await page.goto('/j/tasks')
    await page.getByText('Write the notes').click()
    await expect(drawer(page).getByRole('textbox', { name: 'Title' })).toHaveValue('Write the notes')

    await drawer(page).getByRole('textbox', { name: 'Title' }).fill('Write the release notes')
    await drawer(page).getByRole('button', { name: 'Save and next' }).click()

    // still open, now on the next record
    await expect(drawer(page).getByRole('textbox', { name: 'Title' })).toHaveValue('Tag the build')
    await expect(drawer(page).getByRole('textbox', { name: 'Id' })).toHaveValue('T-03')
    await drawer(page).getByRole('button', { name: 'Cancel' }).click()
    await expect(drawer(page)).toHaveCount(0)
    // the save bumped the version
    await expect.poll(() => rowsOf(page)).toContain('T-02 | Write the release notes | 2 | 2')
  })

  test('Cancel discards what was typed', async ({ page }) => {
    await page.goto('/j/tasks')
    await page.getByText('Plan the release').click()
    await drawer(page).getByRole('textbox', { name: 'Title' }).fill('Never saved')
    await drawer(page).getByRole('button', { name: 'Cancel' }).click()
    await expect(drawer(page)).toHaveCount(0)
    await page.reload()
    await expect.poll(() => rowsOf(page)).toContain('T-01 | Plan the release | 3 | 1')
  })
})

test.describe('optimistic locking (@Version) — two users edit the same record', () => {

  const conflictOf = (page: Page) => page.getByRole('dialog').filter({ hasText: /otro usuario|another user/i })

  /** Both users open the editor; the other saves first; this one then saves over a stale version. */
  async function staleSave(page: Page, other: Page) {
    for (const p of [page, other]) {
      await p.goto('/j/articles/A-1/edit')
      await expect(p.getByRole('textbox', { name: 'Name' })).toHaveValue('Original')
    }
    await other.getByRole('textbox', { name: 'Name' }).fill('Theirs')
    await other.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(other).toHaveURL(/\/j\/articles\/A-1$/)

    await page.getByRole('textbox', { name: 'Name' }).fill('Mine')
    await page.getByRole('spinbutton', { name: 'Stock' }).fill('9')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(conflictOf(page)).toBeVisible()
  }

  const stored = async (page: Page) => {
    await page.goto('/j/articles')
    return rowsOf(page)
  }

  test('the stale save is refused with a conflict dialog and nothing is overwritten behind the user\'s back', async ({ page, browser }) => {
    const other = await (await browser.newContext()).newPage()
    await staleSave(page, other)
    await expect.poll(() => stored(other)).toEqual(['A-1 | Theirs | 7 | 2'])
    await other.context().close()
  })

  // KNOWN BUG, reported for the core/web streams (found writing this journey): BOTH buttons of the
  // conflict dialog are dispatched by the CRUD MEDIATOR with ITS component state, not the editor
  // form's — no id, no fields. Overwrite (`save` + `_forceOverwrite`) answers "Item saved
  // successfully" and navigates to /j/articles/null ("Not found: null"), the user's change lost and
  // the dialog left open; Reload (`cancel-edit`) lands on the same /null page. OptimisticLockSyncTest
  // passes because it sends the form state by hand. The same in a drawer, below. Un-fixme the three
  // tests when fixed.
  test.fixme('Overwrite wins explicitly: every field of mine, the stored version bumped (2 → 3)', async ({ page, browser }) => {
    const other = await (await browser.newContext()).newPage()
    await staleSave(page, other)
    await conflictOf(page).getByRole('button', { name: /Sobrescribir|Overwrite/ }).click()
    await expect(conflictOf(page)).toHaveCount(0)
    await expect.poll(() => stored(other)).toEqual(['A-1 | Mine | 9 | 3'])
    await other.context().close()
  })

  test.fixme('Reload shows the other user\'s change and drops mine', async ({ page, browser }) => {
    const other = await (await browser.newContext()).newPage()
    await staleSave(page, other)
    await conflictOf(page).getByRole('button', { name: /Recargar|Reload/ }).click()
    await expect(conflictOf(page)).toHaveCount(0)
    await expect(page.getByText('Theirs').first()).toBeVisible()
    await expect.poll(() => stored(other)).toEqual(['A-1 | Theirs | 7 | 2'])
    await other.context().close()
  })

  // The same bug in a create-edit DRAWER (editInDrawer): the re-dispatched save carries the
  // LISTING's state plus the typed title, no id — so it CREATES a new row ("T-04 | Mine | 0 | 1")
  // and the record being edited is never overwritten.
  test.fixme('in a create-edit drawer, Overwrite overwrites the record it was editing', async ({ page, browser }) => {
    const other = await (await browser.newContext()).newPage()
    for (const p of [page, other]) {
      await p.goto('/j/tasks')
      await p.getByText('Tag the build').click()
      await expect(drawer(p).getByRole('textbox', { name: 'Title' })).toHaveValue('Tag the build')
    }
    await drawer(other).getByRole('textbox', { name: 'Title' }).fill('Theirs')
    await drawer(other).getByRole('button', { name: 'Save', exact: true }).click()
    await expect(drawer(other)).toHaveCount(0)
    await drawer(page).getByRole('textbox', { name: 'Title' }).fill('Mine')
    await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()
    await conflictOf(page).getByRole('button', { name: /Sobrescribir|Overwrite/ }).click()
    await other.reload()
    await expect.poll(() => rowsOf(other)).toEqual([
      'T-01 | Plan the release | 3 | 1', 'T-02 | Write the notes | 2 | 1', 'T-03 | Mine | 1 | 3'])
    await other.context().close()
  })
})

test.describe('inline editing (/j/stock)', () => {

  test('a committed cell saves its row at once; the change survives a reload', async ({ page }) => {
    const sent = posts(page)
    await page.goto('/j/stock')
    // rows in id order: Bolts, Nuts, Washers
    const quantity = (n: number) => page.getByRole('spinbutton', { name: 'Quantity' }).nth(n)
    const nuts = quantity(1)
    await expect(nuts).toHaveValue('20')
    // opening the page saved nothing (a checkbox/number editor initialising is not a commit)
    expect(sent.filter(s => s.body.includes('"update-row"'))).toHaveLength(0)

    await nuts.fill('25')
    await nuts.press('Enter')
    await expect.poll(() => sent.filter(s => s.body.includes('"update-row"')).length).toBe(1)
    const update = JSON.parse(sent.find(s => s.body.includes('"update-row"'))!.body)
    expect(update.parameters._editedRow).toMatchObject({ id: 'S-2', quantity: 25 })

    await page.reload()
    await expect(quantity(1)).toHaveValue('25')
    await expect(quantity(0)).toHaveValue('10')
  })

  test('@ReadOnly columns stay display-only', async ({ page }) => {
    await page.goto('/j/stock')
    await expect(page.getByRole('spinbutton', { name: 'Quantity' })).toHaveCount(3)
    // id and name are text in the cells, not editors
    await expect(page.getByRole('treegrid').getByRole('textbox')).toHaveCount(0)
    await expect(page.getByRole('gridcell', { name: 'Bolts', exact: true })).toBeVisible()
  })
})
