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
});
