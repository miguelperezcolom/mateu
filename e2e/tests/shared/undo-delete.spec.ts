import { test, expect } from '@playwright/test';

// W-V-DELETE-FEEDBACK + W-V-TABLE-ID on /undo-notes (UndoNotesCrud, Restorable): the id is no
// column, Delete asks nothing and its toast's Undo brings the row back.
test.describe('undoable delete', () => {
  test.describe.configure({ mode: 'serial' });

  test('the technical id is not a column; the text is the first one', async ({ page }) => {
    await page.goto('/undo-notes');
    await expect(page.getByText('Buy milk').first()).toBeVisible();
    const headers = await page.locator('vaadin-grid-sorter, vaadin-grid-cell-content').allInnerTexts();
    expect(headers.map((h) => h.trim())).not.toContain('Id');
  });

  test('delete answers an Undo toast and Undo restores the row', async ({ page }) => {
    await page.goto('/undo-notes');
    await expect(page.getByText('Call Ana').first()).toBeVisible();
    await page.locator('vaadin-grid vaadin-checkbox').nth(2).click();
    await page.locator('vaadin-button').filter({ hasText: 'Delete' }).first().click();
    // no confirmation dialog: the row goes at once and the toast offers the way back
    await expect(page.locator('vaadin-notification-card').getByText('1 record deleted')).toBeVisible();
    await expect(page.locator('vaadin-grid').getByText('Call Ana')).toHaveCount(0);
    await page.getByRole('button', { name: /undo/i }).first().click();
    await expect(page.locator('vaadin-notification-card').getByText('1 record restored')).toBeVisible();
    await expect(page.locator('vaadin-grid').getByText('Call Ana').first()).toBeVisible();
  });

  // 3.0.0 videos: on a searched listing, a delete answered EVERY row (the search after it went out
  // without the text) while the chip still said "a"; the row that moved into the deleted one's
  // place showed selected, Delete stayed enabled, and the Undo brought the row back selected.
  test('a delete and its Undo keep the search and leave nothing selected', async ({ page }) => {
    const searches: Array<Record<string, unknown>> = [];
    page.on('request', (request) => {
      if (request.method() !== 'POST' || !request.url().includes('/mateu/v3/')) return;
      const body = JSON.parse(request.postData() ?? '{}');
      if (body.actionId === 'search') searches.push(body.componentState ?? {});
    });
    await page.goto('/undo-notes');
    await expect(page.getByText('Buy milk').first()).toBeVisible();
    await page.locator('mateu-filter-bar input.free-text').click();
    await page.keyboard.press('Escape');
    await page.keyboard.type('a');
    await page.keyboard.press('Enter');
    // "a": Call Ana and Pay rent, not Buy milk
    await expect(page.locator('vaadin-grid').getByText('Buy milk')).toHaveCount(0);
    await expect(page).toHaveURL(/searchText=a/);
    const grid = page.locator('vaadin-grid').first();
    const selected = () => grid.evaluate((g) => ((g as unknown as { selectedItems?: unknown[] }).selectedItems ?? []).length);
    const deleteButton = page.locator('vaadin-button').filter({ hasText: 'Delete' }).first();

    await page.locator('vaadin-grid vaadin-checkbox').nth(1).click();
    await expect.poll(selected).toBe(1);
    searches.length = 0;
    await deleteButton.click();
    await expect(page.locator('vaadin-notification-card').getByText('1 record deleted')).toBeVisible();
    await expect.poll(() => searches.length).toBeGreaterThan(0);
    expect(searches.every((state) => state.searchText === 'a')).toBe(true);
    await expect(page).toHaveURL(/searchText=a/);
    await expect(page.locator('vaadin-grid').getByText('Buy milk')).toHaveCount(0);
    // the row now in the deleted one's place is not selected, and Delete is off again
    await expect.poll(selected).toBe(0);
    await expect(deleteButton).toBeDisabled();

    searches.length = 0;
    await page.getByRole('button', { name: /undo/i }).first().click();
    await expect(page.locator('vaadin-notification-card').getByText('1 record restored')).toBeVisible();
    await expect.poll(() => searches.length).toBeGreaterThan(0);
    expect(searches.every((state) => state.searchText === 'a')).toBe(true);
    await expect(page.locator('vaadin-grid').getByText('Buy milk')).toHaveCount(0);
    await expect.poll(selected).toBe(0);
  });
});
