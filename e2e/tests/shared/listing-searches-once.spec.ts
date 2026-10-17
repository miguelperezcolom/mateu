import { test, expect, Page } from '@playwright/test';

/**
 * One listing, one search. Two cases used to send it twice — harmless on screen, but every search
 * is a query against the store, and the second of the pair could land after the first and win:
 *
 * - a filtered deep link (`?department=Engineering`): the listing ran its filtered search itself
 *   (it is the one reading the URL) and the enclosing component's OnLoad `search` fired right after
 *   with the same state;
 * - a delete (or a bulk action) from the listing: the server answered a `/list` route the client
 *   did not consider the same place as the listing on screen — so the mediator reloaded it and the
 *   fresh copy searched on load — AND the `listing-changed` event, which re-searched the dying one.
 */
const countSearches = (page: Page) => {
    const log: string[] = [];
    page.on('request', (request) => {
        if (request.method() !== 'POST' || !request.url().includes('/mateu/v3/')) return;
        try {
            const body = JSON.parse(request.postData() ?? '{}');
            if (body.actionId === 'search') log.push(String(body.route));
        } catch { /* not a Mateu request body */ }
    });
    return log;
};

test('a filtered deep link sends exactly one search, carrying the filter', async ({ page }) => {
    const searches: Record<string, unknown>[] = [];
    page.on('request', (request) => {
        if (request.method() !== 'POST' || !request.url().includes('/mateu/v3/')) return;
        const body = JSON.parse(request.postData() ?? '{}');
        if (body.actionId === 'search') searches.push(body.componentState ?? {});
    });
    await page.goto('/catalog-filterable?department=Engineering');
    await expect(page.getByText('Alice').first()).toBeVisible();
    await page.waitForTimeout(1200);
    expect(searches).toHaveLength(1);
    expect(searches[0].department).toBe('Engineering');
});

test('a deep link to a page sends one search, for that page', async ({ page }) => {
    const pages: unknown[] = [];
    page.on('request', (request) => {
        if (request.method() !== 'POST' || !request.url().includes('/mateu/v3/')) return;
        const body = JSON.parse(request.postData() ?? '{}');
        if (body.actionId === 'search') pages.push(body.componentState?.page);
    });
    await page.goto('/catalog-filterable?page=1');
    await page.waitForTimeout(1500);
    expect(pages).toHaveLength(1);
    expect(String(pages[0])).toBe('1');
});

test('a delete from the listing sends exactly one search and keeps the listing url', async ({ page }) => {
    await page.goto('/full-crud');
    await expect(page.getByText('t1').first()).toBeVisible();
    const searches = countSearches(page);
    await page.locator('vaadin-grid vaadin-checkbox').nth(1).click();
    await page.locator('vaadin-button').filter({ hasText: 'Delete' }).first().click();
    // the confirmation dialog's own Delete (the listing's is behind the backdrop)
    await page.getByRole('button', { name: 'Delete' }).first().click();
    await page.waitForTimeout(1500);
    expect(searches).toHaveLength(1);
    await expect(page).toHaveURL(/\/full-crud\/?$/);
});
