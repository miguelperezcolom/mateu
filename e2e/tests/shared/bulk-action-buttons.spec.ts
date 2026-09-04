import { test, expect, Page } from '@playwright/test';

/**
 * A bulk button on a listing toolbar wears what @Toolbar declares and confirms with what @Action
 * declares. Both are read in the browser, because "the wire carries it" and "the user sees it" are
 * different claims: the colour has to survive the renderer's theming and the texts have to reach
 * the dialog instead of its generic wording.
 */

// a toast is announced twice by design — the accessibility live region and the notification card —
// so every toast assertion pins itself to the first match
const toolbarButton = (page: Page, label: string) =>
    page.locator('vaadin-button, button').filter({ hasText: label }).first();

const selectFirstRow = async (page: Page) => {
    // the selection checkbox column of the grid; bulk actions are blocked while nothing is selected
    await page.locator('vaadin-grid vaadin-checkbox').nth(1).click();
};

test.beforeEach(async ({ page }) => {
    await page.goto('/bulk-actions');
    await expect(page.locator('mateu-page')).toBeVisible();
    await expect(page.getByText('Process 1').first()).toBeVisible();
});

test('a bulk button declaring @Toolbar renders in its declared colour', async ({ page }) => {
    const cancel = toolbarButton(page, 'Cancel');
    await expect(cancel).toBeVisible();
    // vaadin-button carries it as a theme, the DS-neutral fallback as a class — either way the
    // button says "destructive" instead of looking like every other button on the toolbar
    const marked = await cancel.evaluate((el) =>
        (el.getAttribute('theme') ?? '').includes('error') || el.className.includes('danger'));
    expect(marked).toBe(true);
});

test('a bulk button without @Toolbar keeps the default look', async ({ page }) => {
    const retry = toolbarButton(page, 'Retry from failure');
    await expect(retry).toBeVisible();
    const marked = await retry.evaluate((el) =>
        (el.getAttribute('theme') ?? '').includes('error') || el.className.includes('danger'));
    expect(marked).toBe(false);
});

test('the confirmation dialog shows the texts the @Action declares', async ({ page }) => {
    await selectFirstRow(page);
    await toolbarButton(page, 'Cancel').click();
    await expect(page.getByText('Cancel processes')).toBeVisible();
    await expect(page.getByText('Cancelling stops every selected process. This cannot be undone.'))
        .toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel them' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Keep running' })).toBeVisible();
    // and confirming actually runs the bulk method over the selection
    await page.getByRole('button', { name: 'Cancel them' }).click();
    await expect(page.getByText('1 cancelled').first()).toBeVisible();
});

test('a bulk button declaring no texts still gets the generic dialog', async ({ page }) => {
    await selectFirstRow(page);
    await toolbarButton(page, 'Retry from failure').click();
    await expect(page.getByText('Are you sure?')).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText('1 retried').first()).toBeVisible();
});

test('the selection guard survives adding an @Action to the button', async ({ page }) => {
    // nothing selected: the click is refused before any dialog opens
    await toolbarButton(page, 'Cancel').click();
    await expect(page.getByText('You first need to select some rows').first()).toBeVisible();
    await expect(page.getByText('Cancel processes')).toHaveCount(0);
});
