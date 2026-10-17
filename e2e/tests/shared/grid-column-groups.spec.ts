import { test, expect } from '@playwright/test';

/**
 * Column groups: a header spanning several columns (GridGroupColumn). Before the fix the group left
 * the server under an unregistered wire name and with NO columns, so the grouped columns never
 * reached the screen. Fixture: GroupedGridForm (/grouped-grid) — "Occupancy" over Adults + Children.
 */

test('a column group renders as a header group over its columns, and their cells show', async ({ page }) => {
    await page.goto('/grouped-grid');
    await expect(page.locator('mateu-page, vaadin-grid').first()).toBeVisible();

    const group = page.locator('vaadin-grid-column-group');
    await expect(group).toHaveCount(1);
    await expect(group).toHaveAttribute('header', 'Occupancy');
    await expect(group.locator('vaadin-grid-column')).toHaveCount(2);
    await expect(group.locator('vaadin-grid-column').nth(0)).toHaveAttribute('path', 'adults');
    await expect(group.locator('vaadin-grid-column').nth(1)).toHaveAttribute('path', 'children');

    // the group header and the grouped columns' headers are painted, and their cells hold the rows
    const content = page.locator('vaadin-grid-cell-content');
    await expect(content.filter({ hasText: /^Occupancy$/ })).toHaveCount(1);
    await expect(content.filter({ hasText: /^Adults$/ })).toHaveCount(1);
    await expect(content.filter({ hasText: /^Children$/ })).toHaveCount(1);
    await expect(content.filter({ hasText: /^101$/ })).toBeVisible();
});
