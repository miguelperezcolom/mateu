import { test, expect, Page } from '@playwright/test';

/**
 * A listing shows what its URL asks for — whatever opens it: a pasted link, the assistant, the
 * shell's own navigation — and keeps the URL saying what it shows.
 *
 * - Every DECLARED filter is settable by its field name: `?kind=Even` (a `Set<Enum>`), and the
 *   free-text search as `searchText` (or `q`).
 * - `?ids=t2,t5` is the framework's reserved id-set filter: no listing declares it, and this one's
 *   search never reads it — the framework narrows the page to those rows.
 * - Both show as normal removable chips; removing one re-searches and drops it from the URL.
 * - Reaching the SAME listing with another query (the assistant opening it filtered while it is
 *   already on screen) applies exactly the new query.
 *
 * Inside a REMOTE app of a federated shell, which is how ec-demo1 serves its listings.
 */
const rowIds = async (page: Page) => {
    const cells = page.locator('vaadin-grid-cell-content').filter({ hasText: /^Remote thing \d$/ })
    const texts = await cells.allInnerTexts()
    return texts.map(text => 't' + text.replace('Remote thing ', '')).sort()
}

const chip = (page: Page, label: string) => page.locator('mateu-filter-bar .chip').filter({ hasText: label })

test.describe('a listing narrowed from its URL', () => {

    test('a declared enum filter from the URL: the rows and a removable chip', async ({ page }) => {
        await page.goto('/remote/things?kind=Even')
        await expect(chip(page, 'Kind')).toBeVisible()
        await expect.poll(() => rowIds(page)).toEqual(['t2', 't4', 't6', 't8'])
        // the query arrives once: the remote reads "Even", not "Even?kind=Even"
        expect(page.url()).toContain('kind=Even')
        expect(page.url()).not.toContain('kind=Even?')

        await chip(page, 'Kind').locator('.chip-remove').click()
        await expect.poll(() => rowIds(page)).toHaveLength(8)
        expect(new URL(page.url()).searchParams.get('kind')).toBeNull()
    })

    test('the id set (?ids=…) shows exactly those rows on a listing that declares nothing for it', async ({ page }) => {
        await page.goto('/remote/things?ids=t2,t5')
        await expect(chip(page, 'Selection')).toContainText('t2, t5')
        await expect.poll(() => rowIds(page)).toEqual(['t2', 't5'])
        await page.screenshot({ path: test.info().outputPath('ids-chip.png') })

        await chip(page, 'Selection').locator('.chip-remove').click()
        await expect.poll(() => rowIds(page)).toHaveLength(8)
        expect(new URL(page.url()).searchParams.get('ids')).toBeNull()
    })

    test('ids combine with declared filters and the search text (q is its alias)', async ({ page }) => {
        await page.goto('/remote/things?ids=t2,t3,t4&kind=Even&q=thing%204')
        await expect.poll(() => rowIds(page)).toEqual(['t4'])
        await expect(chip(page, 'Text')).toContainText('thing 4')
        // the listing owns the URL now: the alias is written as searchText
        await expect.poll(() => new URL(page.url()).searchParams.get('searchText')).toBe('thing 4')
    })

    test('the same listing reached with another query applies exactly that query', async ({ page }) => {
        await page.goto('/remote/things?kind=Odd')
        await expect.poll(() => rowIds(page)).toEqual(['t1', 't3', 't5', 't7'])

        // what the chat does with the agent's [NAVIGATE:{…}]: a navigation-requested from inside the
        // app, same path, another query
        await page.evaluate(() => {
            const host = document.querySelector('mateu-ui') ?? document.body
            const target = (host.shadowRoot ?? host).querySelector('*') ?? host
            target.dispatchEvent(new CustomEvent('navigate-to-requested', {
                detail: { route: '/remote/things?ids=t6,t8' }, bubbles: true, composed: true,
            }))
        })
        await expect.poll(() => rowIds(page)).toEqual(['t6', 't8'])
        await expect(chip(page, 'Kind')).toHaveCount(0)
        await expect(chip(page, 'Selection')).toContainText('t6, t8')
        expect(page.url()).toContain('ids=t6')
    })
})
