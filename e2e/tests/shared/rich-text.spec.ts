import { test, expect } from '@playwright/test';

// The editable rich text field runs on Mateu's own editor (Tiptap / ProseMirror), not vaadin-rich-text-editor,
// which is under Vaadin's commercial licence. What matters to an app: an HTML value opens
// formatted, what the user types reaches the server as HTML, and data written by the old editor
// (Quill Delta JSON) still opens.
test.describe('RichTextForm (/rich-text)', () => {

  test('an HTML value opens formatted, and an edit reaches the server as HTML', async ({ page }) => {
    await page.goto('/rich-text');

    const editor = page.locator('mateu-rich-text-editor').first().locator('.ProseMirror');
    await expect(editor.locator('strong')).toHaveText('quiet');

    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' and late ');
    await page.keyboard.press('ControlOrMeta+b');
    await page.keyboard.type('checkout');

    await page.getByRole('button', { name: 'Show' }).click();
    await expect(page.getByText(/notes=<p>Guest prefers a <strong>quiet<\/strong> room and late <strong>checkout<\/strong><\/p>/).first())
      .toBeVisible();
  });

  test('a value stored by the old editor (Delta JSON) still opens', async ({ page }) => {
    await page.goto('/rich-text');

    const legacy = page.locator('mateu-rich-text-editor').nth(1).locator('.ProseMirror');
    await expect(legacy.locator('strong')).toHaveText('Hi');
  });

});
