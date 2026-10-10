import { test, expect } from '@playwright/test';

// A LongTask streams its progress over Server-Sent Events (POST <baseUrl>/mateu/v3/sse/**): one
// increment per step, applied as it arrives. WebFlux, Quarkus and Helidon used to answer that path
// with ONE plain JSON body, which the renderer cannot read as a stream — the button did nothing at
// all. Runs against every adapter (shared suite), so each one has to stream.
test.describe('LongTaskForm (/long-task)', () => {

  test('the progress dialog moves while the task runs and ends in its final state', async ({ page }) => {
    await page.goto('/long-task');

    const sse = page.waitForResponse(
      (r) => r.url().includes('/mateu/v3/sse/') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Run long task' }).click();

    const response = await sse;
    expect(response.headers()['content-type']).toContain('text/event-stream');

    // the progress dialog opens with the task's title…
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Processing', { exact: true })).toBeVisible();
    // …and shows an INTERMEDIATE step before the end: proof the increments are streamed, not
    // delivered all together when the task is over.
    await expect(dialog.getByText(/^Step [1-4] of 5$/)).toBeVisible();

    // final state: the done title and text, and a full progress bar
    await expect(dialog.getByText('Long task finished', { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText('All 5 steps processed', { exact: true })).toBeVisible();
    await expect(dialog.locator('vaadin-progress-bar')).toHaveJSProperty('value', 1);
    // a progress step is no page: the window title stays the screen's
    await expect(page).toHaveTitle('Long task');
  });

});
