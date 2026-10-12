import { test, expect, Page } from '@playwright/test';

/**
 * Whole-row click (decision U1): on a navigable listing, clicking ANYWHERE on a row opens the
 * record — not only the id link. Except the cells with a click of their own: a button column runs
 * its action and the selection checkbox selects, and neither leaves the listing.
 *
 * Fixture: RowOpenListingForm (/row-open) — Navigable + Deletable (selection) + a button column.
 */

const cell = (page: Page, text: string) =>
    page.locator('vaadin-grid-cell-content').filter({ hasText: text }).first();

test.beforeEach(async ({ page }) => {
    await page.goto('/row-open');
    await expect(page.locator('mateu-page')).toBeVisible();
    await expect(cell(page, 'London')).toBeVisible();
});

test('clicking a plain cell opens the record', async ({ page }) => {
    await cell(page, 'London').click();
    await expect(page).toHaveURL(/\/row-open\/R-001/);
});

test('clicking the name (not the id link) opens the record too', async ({ page }) => {
    await cell(page, 'Grace Hopper').click();
    await expect(page).toHaveURL(/\/row-open\/R-002/);
});

test('a button column runs its own action and does not open the row', async ({ page }) => {
    await page.locator('vaadin-grid vaadin-button').filter({ hasText: 'Approve' }).first().click();
    // a toast is announced twice by design (live region + card): pin to the first
    await expect(page.getByText('Approved Ada Lovelace').first()).toBeVisible();
    await expect(page).toHaveURL(/\/row-open\/?$/);
});

test('the selection checkbox selects the row and does not open it', async ({ page }) => {
    // nth(0) is the header's select-all
    const checkbox = page.locator('vaadin-grid vaadin-checkbox').nth(1);
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('checked', '');
    await expect(page).toHaveURL(/\/row-open\/?$/);
});

test('Enter on a focused row cell opens the record', async ({ page }) => {
    // focus the body cell that holds "Rotterdam" (the cell, not its text: that is what the grid's
    // keyboard navigation focuses)
    await cell(page, 'Rotterdam').evaluate((content) => {
        const td = (content as HTMLElement).assignedSlot?.parentElement as HTMLElement | null;
        td?.focus();
    });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/row-open\/R-003/);
});
