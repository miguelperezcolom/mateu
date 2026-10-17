import { test, expect } from '@playwright/test';

/**
 * A listing an ACTION returns loads its rows again (the demo-vb-pms FolioWindows pattern: an action
 * answers `List.of(this, message)`). The header above the table used to update while the table
 * kept its OLD rows until the next search — its OnLoad search counted as already fired.
 *
 * Fixture: ReturnedListingForm (/returned-listing) — a header with the row count and an
 * "Add a row" button whose action appends a row and returns the page.
 */
test('the rows of a listing returned by an action are reloaded', async ({ page }) => {
    await page.goto('/returned-listing');
    const grid = page.locator('vaadin-grid').first();
    await expect(grid.locator('vaadin-grid-cell-content').filter({ hasText: 'First row' }).first()).toBeVisible();

    const count = page.getByText(/^\d+ rows$/).first();
    const before = Number((await count.textContent())!.split(' ')[0]);

    await page.locator('vaadin-button').filter({ hasText: 'Add a row' }).first().click();

    const added = `Added row ${before + 1}`;
    await expect(page.getByText(`${added} added`).first()).toBeVisible();
    // the header re-rendered…
    await expect(page.getByText(`${before + 1} rows`).first()).toBeVisible();
    // …and so did the table, with no search of its own
    await expect(grid.locator('vaadin-grid-cell-content').filter({ hasText: added }).first()).toBeVisible();
});
