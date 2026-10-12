import { test, expect, Page } from '@playwright/test';

/**
 * A listing built from capabilities, walked the way a user walks it: search, the filter panel
 * (text, number range, date range, multi-select), header sort, the pager, the URL that carries all
 * of it (deep link, reload, back/forward), the record a row opens — and the editable-listing idiom
 * (Editable without Navigable: create and edit in a drawer, delete with confirmation).
 *
 * Fixtures (sample1, served by every adapter): CapabilityBooks (/capability-books — Searchable +
 * Filterable<BookFilters> + Navigable, 30 rows, honours page/size/sort), CapabilityNotes
 * (/capability-notes — Searchable + Editable + Creatable + Deletable, mutable).
 */

/** The text of the first cell (the id) of every row the grid shows, in order. */
const ids = (page: Page) =>
    page.evaluate(() => {
        const grids: Element[] = []
        ;(function find(root: Document | ShadowRoot) {
            for (const el of Array.from(root.querySelectorAll('*'))) {
                if (el.tagName === 'VAADIN-GRID') grids.push(el)
                if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
            }
        })(document)
        const grid = grids[0] as HTMLElement | undefined
        if (!grid?.shadowRoot) return []
        return Array.from(grid.shadowRoot.querySelectorAll('tbody#items tr'))
            .filter(tr => !(tr as HTMLElement).hidden)
            .map(tr => {
                const slot = tr.querySelector('td slot') as HTMLSlotElement | null
                return slot?.assignedElements()[0]?.textContent?.trim() ?? ''
            })
            .filter(Boolean)
    })

const expectIds = async (page: Page, expected: string[]) =>
    expect.poll(() => ids(page), { timeout: 10000 }).toEqual(expected)

const openFilter = async (page: Page, label: string) => {
    await page.locator('.smart-search .bar').click()
    await page.locator('.panel .panel-row', { hasText: label }).first().click()
}

test.describe('capability listing — search, filters, sort, paging and the URL', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/capability-books')
        await expectIds(page, ['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'B-08', 'B-09', 'B-10'])
    })

    test('a bare navigable finder offers no create or delete chrome', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'New', exact: true })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0)
    })

    test('the search text matches every word, in any order', async ({ page }) => {
        await page.locator('input.free-text').fill('borges book')
        await page.locator('input.free-text').press('Enter')
        await expectIds(page, ['B-01', 'B-04', 'B-07', 'B-10', 'B-13', 'B-16', 'B-19', 'B-22', 'B-25', 'B-28'])
        await expect(page).toHaveURL(/\/capability-books\?searchText=borges\+book$/)
        await page.locator('.chip .chip-remove').first().click()
        await expectIds(page, ['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'B-08', 'B-09', 'B-10'])
    })

    test('typed filters narrow the rows, show as chips and survive a reload', async ({ page }) => {
        await openFilter(page, 'Pages')
        await page.locator('input.range-from').fill('50')
        await page.locator('input.range-to').fill('120')
        await page.locator('.apply-button').click()
        await expectIds(page, ['B-05', 'B-06', 'B-07', 'B-08', 'B-09', 'B-10', 'B-11', 'B-12'])

        await openFilter(page, 'Genre')
        await page.locator('.panel .panel-row', { hasText: 'Novel' }).click()
        await expectIds(page, ['B-06', 'B-09', 'B-12'])
        await page.keyboard.press('Escape')

        await openFilter(page, 'Published')
        await page.locator('input.range-from').fill('2006-01-01')
        await page.locator('input.range-to').fill('2011-12-31')
        await page.locator('.apply-button').click()
        await expectIds(page, ['B-06', 'B-09'])

        // the URL carries every condition — on the page's own path, never doubled
        await expect(page).toHaveURL(/\/capability-books\?pages_from=50&pages_to=120&published_from=2006-01-01&published_to=2011-12-31&genre=NOVEL$/)
        await page.reload()
        await expectIds(page, ['B-06', 'B-09'])
        await expect(page).toHaveURL(/\/capability-books\?/)
        await expect(page.locator('.chip')).toHaveCount(3)
    })

    test('Export CSV downloads the filtered rows; no Excel without an exporter', async ({ page }) => {
        await page.goto('/capability-books?genre=NOVEL')
        await expectIds(page, ['B-03', 'B-06', 'B-09', 'B-12', 'B-15', 'B-18', 'B-21', 'B-24', 'B-27', 'B-30'])
        await expect(page.getByRole('button', { name: /excel/i })).toHaveCount(0)
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export CSV' }).click(),
        ])
        const fs = await import('fs')
        const csv = fs.readFileSync((await download.path())!, 'utf8').trim().split('\n')
        expect(csv[0]).toBe('Id,Title,Author,Pages,Published,Genre')
        expect(csv).toHaveLength(11)
    })

    test('a deep link with filters stays on the listing\'s own path', async ({ page }) => {
        await page.goto('/capability-books?genre=NOVEL')
        await expectIds(page, ['B-03', 'B-06', 'B-09', 'B-12', 'B-15', 'B-18', 'B-21', 'B-24', 'B-27', 'B-30'])
        // it used to become /capability-books/capability-books?genre=NOVEL, which a reload 404s
        await expect(page).toHaveURL(/\/capability-books\?genre=NOVEL$/)
    })

    test('a header sorts on the server, ascending then descending, across pages', async ({ page }) => {
        const pages = page.locator('vaadin-grid-sorter', { hasText: 'Pages' })
        await pages.click()
        await expect(page).toHaveURL(/sort=pages%3Aascending/)
        await pages.click()
        await expect(page).toHaveURL(/sort=pages%3Adescending/)
        // the SERVER's order, not the page re-sorted in the browser: page 1 holds the 10 thickest
        await expectIds(page, ['B-30', 'B-29', 'B-28', 'B-27', 'B-26', 'B-25', 'B-24', 'B-23', 'B-22', 'B-21'])
        await expect(pages).toHaveAttribute('direction', 'desc')

        await page.getByRole('button', { name: /next page/i }).click()
        await expect(page).toHaveURL(/page=1&sort=pages%3Adescending/)
        await expectIds(page, ['B-20', 'B-19', 'B-18', 'B-17', 'B-16', 'B-15', 'B-14', 'B-13', 'B-12', 'B-11'])

        await page.reload()
        await expectIds(page, ['B-20', 'B-19', 'B-18', 'B-17', 'B-16', 'B-15', 'B-14', 'B-13', 'B-12', 'B-11'])
        await expect(page.locator('vaadin-grid-sorter', { hasText: 'Pages' })).toHaveAttribute('direction', 'desc')
    })

    test('a row opens its record; back returns to the same page and sort, forward to the record', async ({ page }) => {
        await page.goto('/capability-books?page=1&sort=pages:descending')
        await expectIds(page, ['B-20', 'B-19', 'B-18', 'B-17', 'B-16', 'B-15', 'B-14', 'B-13', 'B-12', 'B-11'])
        await page.locator('vaadin-grid-cell-content', { hasText: 'Book 20' }).click()
        // the record, at a clean url (the listing's query is not where it is mounted)
        await expect(page).toHaveURL(/\/capability-books\/B-20$/)
        await expect(page.getByText('Book 20').first()).toBeVisible()

        await page.goBack()
        await expectIds(page, ['B-20', 'B-19', 'B-18', 'B-17', 'B-16', 'B-15', 'B-14', 'B-13', 'B-12', 'B-11'])

        await page.goForward()
        await expect(page).toHaveURL(/\/capability-books\/B-20$/)
        await expect(page.locator('vaadin-grid')).toHaveCount(0)
        await expect(page.getByText('Book 20').first()).toBeVisible()
    })

    test('a deep link to a record opens the record, not the listing', async ({ page }) => {
        await page.goto('/capability-books/B-07')
        await expect(page.getByText('Book 07').first()).toBeVisible()
        await expect(page.locator('vaadin-grid')).toHaveCount(0)
        // a record's generated toString is not its title
        await expect(page.getByText(/Book\[id=/)).toHaveCount(0)
    })
})

test.describe('editable listing — create, edit in a drawer, delete', () => {
    const drawer = (page: Page) => page.locator('mateu-drawer')
    const textInput = (page: Page) => drawer(page).locator('vaadin-text-field').nth(1).locator('input')

    test('create refuses an empty required field, then creates, edits and deletes', async ({ page }) => {
        const tag = `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        await page.goto('/capability-notes')
        await expect(page.locator('vaadin-grid')).toBeVisible()

        await page.getByRole('button', { name: 'New', exact: true }).click()
        await expect(drawer(page)).toHaveCount(1)
        await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()
        // the drawer stays, saying why
        await expect(drawer(page).getByText('Text: Cannot be empty')).toBeVisible()

        await textInput(page).fill(tag)
        await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()
        await expect(drawer(page)).toHaveCount(0)
        await expect(page.locator('vaadin-grid-cell-content', { hasText: tag })).toBeVisible()

        // a row of an editable (not navigable) listing opens its editor in a drawer
        await page.locator('vaadin-grid-cell-content', { hasText: tag }).click()
        await expect(drawer(page)).toHaveCount(1)
        await expect(page).toHaveURL(/\/capability-notes\/?$/)
        await textInput(page).fill(`${tag}-edited`)
        await drawer(page).getByRole('button', { name: 'Save', exact: true }).click()
        await expect(drawer(page)).toHaveCount(0)
        const edited = page.locator('vaadin-grid-cell-content', { hasText: `${tag}-edited` })
        await expect(edited).toBeVisible()

        // select THAT row's checkbox (marked from the row the cell sits in) and delete, confirming
        await page.evaluate((text) => {
            const contents: Element[] = []
            ;(function find(root: Document | ShadowRoot) {
                for (const el of Array.from(root.querySelectorAll('*'))) {
                    if (el.tagName === 'VAADIN-GRID-CELL-CONTENT') contents.push(el)
                    if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
                }
            })(document)
            const cell = contents.find(c => c.textContent?.trim() === text) as HTMLElement | undefined
            const tr = cell?.assignedSlot?.closest('tr')
            const firstSlot = tr?.querySelector('td slot') as HTMLSlotElement | null
            firstSlot?.assignedElements()[0]?.querySelector('vaadin-checkbox')?.setAttribute('data-e2e-pick', '')
        }, `${tag}-edited`)
        await page.locator('vaadin-checkbox[data-e2e-pick]').click()
        await page.getByRole('button', { name: 'Delete', exact: true }).first().click()
        await expect(page.getByText('Delete the selected items?')).toBeVisible()
        await page.locator('[role=dialog], [role=alertdialog]')
            .getByRole('button', { name: 'Delete', exact: true }).click()
        // gone from the rows on screen (the grid may keep a recycled, unassigned cell around)
        await expect(edited).toBeHidden()
        await expect(page).toHaveURL(/\/capability-notes\/?$/)
    })
})

test.describe('AutoCrud — create on its page, delete from the listing', () => {
    test('a deleted row leaves the listing at once, and the url stays on the listing', async ({ page }) => {
        const title = `Task ${Date.now()}-${Math.floor(Math.random() * 1000)}`
        await page.goto('/full-crud/new')
        await page.locator('vaadin-text-field', { hasText: 'Title' }).locator('input').fill(title)
        await page.getByRole('button', { name: /^(Save|Create)$/ }).first().click()
        await expect(page).toHaveURL(/\/full-crud\/[^/]+$/)
        await page.goto('/full-crud')
        const row = page.locator('vaadin-grid-cell-content', { hasText: title })
        await expect(row).toBeVisible()

        await page.evaluate((text) => {
            const contents: Element[] = []
            ;(function find(root: Document | ShadowRoot) {
                for (const el of Array.from(root.querySelectorAll('*'))) {
                    if (el.tagName === 'VAADIN-GRID-CELL-CONTENT') contents.push(el)
                    if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
                }
            })(document)
            const cell = contents.find(c => c.textContent?.trim() === text) as HTMLElement | undefined
            const tr = cell?.assignedSlot?.closest('tr')
            const firstSlot = tr?.querySelector('td slot') as HTMLSlotElement | null
            firstSlot?.assignedElements()[0]?.querySelector('vaadin-checkbox')?.setAttribute('data-e2e-pick', '')
        }, title)
        await page.locator('vaadin-checkbox[data-e2e-pick]').click()
        await page.getByRole('button', { name: 'Delete', exact: true }).first().click()
        await page.locator('[role=dialog], [role=alertdialog]')
            .getByRole('button', { name: 'Delete', exact: true }).click()
        // the listing refreshes in place (it used to keep the deleted row until a reload) and the
        // url is still the listing's (it became /full-crud/full-crud)
        await expect(row).toBeHidden()
        await expect(page).toHaveURL(/\/full-crud\/?$/)
        await page.reload()
        await expect(page.locator('vaadin-grid')).toBeVisible()
        await expect(row).toBeHidden()
    })
})
