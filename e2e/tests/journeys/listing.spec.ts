import { test, expect, Page } from '@playwright/test';
import { gridHeaders, gridRows, resetFixtures } from './_support';

/**
 * Listing journeys the shared suite does not walk: totals and grouping (`@Aggregate`/`@GroupBy`)
 * that follow the search, rows dragged onto a destination (`@DragRows` + `DropZone`), saved views
 * on the smart search bar and the column chooser (both client-side, per browser).
 * Fixtures: JSalesCrud (/j/sales), JChargesListing (/j/charges) in mvc-app1; CapabilityBooks
 * (/capability-books) in sample1.
 */

test.describe.configure({ mode: 'serial' })

const rows = async (page: Page) => (await gridRows(page)).map(cells => cells.filter(Boolean).join(' | '))
/** the footer cells of the first grid (the totals row) */
const footer = (page: Page) =>
  page.evaluate(() => {
    const grids: Element[] = []
    ;(function find(root: Document | ShadowRoot) {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.tagName === 'VAADIN-GRID') grids.push(el)
        if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
      }
    })(document)
    const grid = grids[0] as HTMLElement | undefined
    return Array.from(grid?.shadowRoot?.querySelectorAll('tfoot td slot') ?? [])
      .map(slot => ((slot as HTMLSlotElement).assignedElements()[0]?.textContent ?? '').trim())
      .filter(Boolean)
  })

test.describe('totals and grouping (/j/sales)', () => {

  test('rows are grouped with a subtotal per group and the footer totals everything', async ({ page }) => {
    await page.goto('/j/sales')
    await expect.poll(() => rows(page)).toEqual([
      'North (3) | 440',
      'S-01 | North | Chairs | 100', 'S-03 | North | Lamps | 40', 'S-05 | North | Tables | 300',
      'South (2) | 310',
      'S-02 | South | Tables | 250', 'S-04 | South | Chairs | 60',
    ])
    await expect.poll(() => footer(page)).toEqual(['Total', '750'])
  })

  test('the totals follow the search: they sum the filtered rows, not the whole table', async ({ page }) => {
    await page.goto('/j/sales')
    await page.getByRole('textbox', { name: 'Search' }).fill('chairs')
    await page.getByRole('textbox', { name: 'Search' }).press('Enter')
    await expect.poll(() => rows(page)).toEqual([
      'North (1) | 100', 'S-01 | North | Chairs | 100',
      'South (1) | 60', 'S-04 | South | Chairs | 60',
    ])
    await expect.poll(() => footer(page)).toEqual(['Total', '160'])
  })

  test('a group header is not a record: clicking it opens nothing', async ({ page }) => {
    await page.goto('/j/sales')
    await page.getByText('North (3)').click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/j\/sales$/)
    await page.getByText('Lamps').click()
    await expect(page).toHaveURL(/\/j\/sales\/S-03$/)
  })
})

test.describe('dragging rows to a destination (/j/charges)', () => {
  test.beforeEach(async ({ request }) => { await resetFixtures(request) })

  /** a zone's content (the charge count) is slotted, so read it the way assistive tech does */
  const expectZone = (page: Page, zone: string, count: number) =>
    expect(page.getByRole('group', { name: `${zone} — drop target` }))
      .toMatchAriaSnapshot(`- group "${zone} — drop target": /${count} charges/`)

  async function drag(page: Page, text: string, zone: string) {
    const source = page.locator('vaadin-grid-cell-content', { hasText: text }).first()
    await source.dragTo(page.getByRole('group', { name: `${zone} — drop target` }))
  }

  const moved = [
    'Window 1 (2)', 'C-1 | Window 1 | Room night | 100', 'C-3 | Window 1 | Spa | 80',
    'Window 2 (2)', 'C-2 | Window 2 | Minibar | 12', 'C-4 | Window 2 | Parking | 20',
  ]

  test('dropping a row on another window moves it there: the zones follow, and so do the groups', async ({ page }) => {
    await page.goto('/j/charges')
    await expectZone(page, 'Window 2', 1)
    await drag(page, 'Minibar', 'Window 2')
    await expect(page.getByText('1 charge moved to Window 2').first()).toBeVisible()
    await expectZone(page, 'Window 2', 2)
    await expectZone(page, 'Window 1', 2)
    // the move is on the server: the listing shows it once it searches again
    await page.reload()
    await expect.poll(() => rows(page)).toEqual(moved)
  })

  // KNOWN BUG, reported for the web stream (found writing this journey): the drop answers the
  // listing itself (`List.of(this, message)`, the FolioWindows pattern) — the header zones are
  // re-rendered with the new counts, but the GRID keeps its stale rows until the next search (the
  // re-rendered host is not searched again on the web; Redwood re-runs its OnLoad for this case).
  // So the screen contradicts itself: "Window 2 · 2 charges" above a table showing it holds one.
  test.fixme('the grid refreshes in place after the drop', async ({ page }) => {
    await page.goto('/j/charges')
    await drag(page, 'Minibar', 'Window 2')
    await expect(page.getByText('1 charge moved to Window 2').first()).toBeVisible()
    await expect.poll(() => rows(page)).toEqual(moved)
  })

  test('the selected rows travel together', async ({ page }) => {
    await page.goto('/j/charges')
    await expect.poll(() => rows(page)).toHaveLength(6)
    const checkboxes = page.getByRole('checkbox', { name: 'Select Row' })
    await checkboxes.nth(0).check()   // Room night
    await checkboxes.nth(2).check()   // Spa
    await drag(page, 'Spa', 'Window 2')
    await expect(page.getByText('2 charges moved to Window 2').first()).toBeVisible()
    await expectZone(page, 'Window 1', 1)
  })

  test('dropping a row on the window it is already in moves nothing', async ({ page }) => {
    await page.goto('/j/charges')
    await drag(page, 'Parking', 'Window 2')
    await expect(page.getByText('0 charges moved to Window 2').first()).toBeVisible()
  })
})

test.describe('saved views and the column chooser (/capability-books)', () => {

  const bar = (page: Page) => page.locator('.smart-search')

  test('a filtered view is saved by name, reapplied later and becomes the default view', async ({ page }) => {
    await page.goto('/capability-books?genre=NOVEL')
    await expect(page.locator('.chip')).toHaveCount(1)

    await page.getByRole('button', { name: 'Saved views' }).click()
    await expect(page.getByText('No saved views yet')).toBeVisible()
    await page.getByPlaceholder('Save current view as…').fill('Novels')
    await page.getByPlaceholder('Save current view as…').press('Enter')

    // back to no filters, then apply the view
    await page.goto('/capability-books')
    await expect(page.locator('.chip')).toHaveCount(0)
    await page.getByRole('button', { name: 'Saved views' }).click()
    await bar(page).locator('.view-name', { hasText: 'Novels' }).click()
    await expect(page.locator('.chip')).toHaveCount(1)
    await expect(page).toHaveURL(/genre=NOVEL/)

    // ★ makes it the view the listing opens with when the URL brings no conditions
    await page.getByRole('button', { name: 'Saved views' }).click()
    await bar(page).locator('.view-row', { hasText: 'Novels' }).locator('.view-star').click()
    await page.goto('/capability-books')
    await expect(page).toHaveURL(/genre=NOVEL/)

    // and deleting it forgets it
    await page.getByRole('button', { name: 'Saved views' }).click()
    await page.getByRole('button', { name: 'Delete view Novels' }).click()
    await expect(page.getByText('No saved views yet')).toBeVisible()
  })

  test('hiding and moving columns is remembered across a reload, and Reset brings them back', async ({ page }) => {
    const headers = () => gridHeaders(page)
    await page.goto('/capability-books')
    await expect.poll(headers).toEqual(['Id', 'Title', 'Author', 'Pages', 'Published', 'Genre'])

    await page.getByRole('button', { name: 'Columns' }).click()
    const menu = page.getByRole('menu')
    await menu.locator('.row', { hasText: 'Author' }).getByRole('checkbox').uncheck()
    await menu.getByRole('button', { name: 'Move Genre up' }).click()
    await expect.poll(headers).toEqual(['Id', 'Title', 'Pages', 'Genre', 'Published'])

    await page.reload()
    await expect.poll(headers).toEqual(['Id', 'Title', 'Pages', 'Genre', 'Published'])

    await page.getByRole('button', { name: 'Columns' }).click()
    await page.getByRole('menu').getByRole('button', { name: 'Reset' }).click()
    await expect.poll(headers).toEqual(['Id', 'Title', 'Author', 'Pages', 'Published', 'Genre'])
  })
})
