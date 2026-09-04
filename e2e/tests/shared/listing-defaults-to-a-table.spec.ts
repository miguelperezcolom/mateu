import { test, expect } from '@playwright/test';

/**
 * A listing that declares no `gridLayout()` renders as a TABLE — at any width.
 *
 * <p>It used to be measured instead (total column weight against the available width) and came out
 * a table, a two-line list, cards or a master/detail split depending on the result: the same
 * screen looked like a different screen on a narrower window or once a column was added, and
 * nothing in the model said so. A narrow window now keeps the table and scrolls it sideways
 * inside the listing box, rather than pushing the page — title and toolbar included — off-screen.
 */

const isTable = async (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
        const find = (root: ParentNode): Element | null => {
            for (const el of root.querySelectorAll('*')) {
                if (el.tagName === 'VAADIN-GRID') return el;
                const shadow = (el as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot;
                if (shadow) { const found = find(shadow); if (found) return found; }
            }
            return null;
        };
        return find(document) !== null;
    });

const pageScrollsSideways = async (page: import('@playwright/test').Page) =>
    page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth);

for (const width of [1400, 900, 390]) {
    test(`an undeclared listing is a table at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 700 });
        await page.goto('/items');
        await expect(page.locator('mateu-page')).toBeVisible();
        await expect(page.getByText('Widget A').first()).toBeVisible();
        expect(await isTable(page)).toBe(true);
    });
}

test('a narrow window scrolls the listing, not the page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto('/items');
    await expect(page.getByText('Widget A').first()).toBeVisible();
    // the listing wants 30rem (480px) but must never make the page itself scroll sideways
    expect(await pageScrollsSideways(page)).toBe(false);
});
