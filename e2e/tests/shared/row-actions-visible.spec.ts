import { test, expect } from '@playwright/test';

/**
 * Row actions stay on screen: on a listing wider than the viewport, the per-row actions column
 * (the last one) is pinned to the grid's end edge, so a row can be acted on without scrolling
 * sideways.
 *
 * Fixture: WideRowActionsListing (/wide-row-actions) — eleven wide text columns + a
 * ColumnActionGroup column.
 */

test.use({ viewport: { width: 1920, height: 1080 } });

test('the row actions column is within the viewport without scrolling', async ({ page }) => {
    await page.goto('/wide-row-actions');
    // two actions per row: the cell draws them as a "···" menu
    const claim = page.getByRole('menuitem', { name: '···' }).first();
    await expect(claim).toBeVisible();

    // the listing really is wider than its grid: there is something to scroll
    const grid = page.locator('vaadin-grid').first();
    const overflow = await grid.evaluate((g) => {
        const table = g.shadowRoot!.querySelector('#table') as HTMLElement;
        return { scrollWidth: table.scrollWidth, clientWidth: table.clientWidth, scrollLeft: table.scrollLeft };
    });
    expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);
    expect(overflow.scrollLeft).toBe(0);

    // and still, with no scroll at all, the action is inside the grid and inside the viewport
    const box = (await claim.boundingBox())!;
    const gridBox = (await grid.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(Math.min(1920, gridBox.x + gridBox.width) + 1);
    expect(box.x).toBeGreaterThanOrEqual(gridBox.x);

    // it works where it is
    await claim.click();
    await page.getByRole('menuitem', { name: 'Claim' }).click();
    await expect(page.getByText('Claimed T-1').first()).toBeVisible();
});
