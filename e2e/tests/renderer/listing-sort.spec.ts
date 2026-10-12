import { test, expect, Page } from '@playwright/test';

/**
 * A header sort is the SERVER's sort, on every renderer: the second click on a header asks for
 * descending and the first page shows the thickest books of the whole collection, in that order.
 * Redwood used to re-sort the page it held in the browser and painted the server's descending page
 * ascending; Vaadin's headers did not sort at all (no reflected column was sortable).
 *
 * Fixture: CapabilityBooks (/capability-books, sample1) — 30 rows, honours page/size/sort.
 */

/** The first-column texts of the rows on screen, whatever the renderer draws them with. */
const firstColumn = (page: Page) =>
    page.evaluate(() => {
        const out: string[] = []
        const tableRows = Array.from(document.querySelectorAll('table tbody tr'))
        if (tableRows.length) {
            for (const tr of tableRows) {
                const t = (tr as HTMLElement).innerText.trim().split(/\s+/)[0]
                if (t) out.push(t)
            }
            return out
        }
        const grids: Element[] = []
        ;(function find(root: Document | ShadowRoot) {
            for (const el of Array.from(root.querySelectorAll('*'))) {
                if (el.tagName === 'VAADIN-GRID') grids.push(el)
                if ((el as HTMLElement).shadowRoot) find((el as HTMLElement).shadowRoot!)
            }
        })(document)
        const grid = grids[0] as HTMLElement | undefined
        for (const tr of Array.from(grid?.shadowRoot?.querySelectorAll('tbody#items tr') ?? [])) {
            if ((tr as HTMLElement).hidden) continue
            const slot = tr.querySelector('td slot') as HTMLSlotElement | null
            const t = slot?.assignedElements()[0]?.textContent?.trim()
            if (t) out.push(t)
        }
        return out
    })

const clickSort = async (page: Page, label: string) => {
    const vaadin = page.locator('vaadin-grid-sorter', { hasText: label })
    if (await vaadin.count()) {
        await vaadin.click()
        return
    }
    const header = page.getByRole('columnheader', { name: new RegExp(label) })
    await header.hover()
    const icon = header.locator('[class*=sort]').first()
    await ((await icon.count()) ? icon : header).click()
}

test('a header sorts on the server, ascending then descending', async ({ page }) => {
    await page.goto('/capability-books')
    await expect.poll(() => firstColumn(page), { timeout: 20000 }).toContain('B-01')
    await clickSort(page, 'Pages')
    await expect.poll(() => firstColumn(page)).toEqual(
        ['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'B-08', 'B-09', 'B-10'])
    await clickSort(page, 'Pages')
    await expect.poll(() => firstColumn(page)).toEqual(
        ['B-30', 'B-29', 'B-28', 'B-27', 'B-26', 'B-25', 'B-24', 'B-23', 'B-22', 'B-21'])
})
