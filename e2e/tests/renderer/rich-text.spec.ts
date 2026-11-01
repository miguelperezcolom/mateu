import { test, expect } from '@playwright/test';

// On Redwood an editable richText is Spectra's own editor (oj-sp-input-rich-text-2, on CKEditor 5)
// inside mateu-rich-text-field. What matters to an app is what tests/shared/rich-text.spec.ts asks of
// the web renderer: an HTML value opens formatted, what the user types reaches the server as HTML,
// and a value stored by the old Vaadin editor (Quill Delta JSON) still opens.
test.describe('RichTextForm (/rich-text) on Redwood', () => {

  test('an HTML value opens formatted in Spectra\'s editor, and an edit reaches the server as HTML', async ({ page }) => {
    await page.goto('/rich-text');

    const editor = page.locator('mateu-rich-text-field').first().locator('oj-sp-input-rich-text-2 [contenteditable="true"]');
    await expect(editor.locator('strong')).toHaveText('quiet', { timeout: 60_000 });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+End');
    // the formatting keys are CKEditor's own business; Mateu's is that the HTML — the bold it opened
    // with, what was typed — reaches the server
    await page.keyboard.type(' and late checkout');
    await expect(editor).toContainText('late checkout');

    // what reaches the server, read off the action itself: Redwood's toast draws the message's
    // tags rather than showing them as text
    const show = page.waitForRequest((r) => r.method() === 'POST' && (r.postData() || '').includes('"actionId":"show"'));
    await page.getByRole('button', { name: 'Show' }).click();
    const state = JSON.parse((await show).postData() || '{}').componentState;
    expect(state.notes).toBe('<p>Guest prefers a <strong>quiet</strong> room and late checkout</p>');
  });

  test('a value stored by the old editor (Delta JSON) still opens', async ({ page }) => {
    await page.goto('/rich-text');

    const legacy = page.locator('mateu-rich-text-field').nth(1).locator('oj-sp-input-rich-text-2 [contenteditable="true"]');
    await expect(legacy.locator('strong')).toHaveText('Hi', { timeout: 60_000 });
  });

});
