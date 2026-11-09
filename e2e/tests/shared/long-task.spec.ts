import { test, expect } from '@playwright/test';

// A LongTask streams its progress over Server-Sent Events (POST <baseUrl>/mateu/v3/sse/**): one
// Progress command per step, applied as it arrives — the task center shows it. WebFlux, Quarkus and
// Helidon used to answer that path with ONE plain JSON body, which the renderer cannot read as a
// stream — the button did nothing at all. Runs against every adapter (shared suite), so each one has
// to stream.
test.describe('LongTaskForm (/long-task)', () => {

  test('a blocking task moves while it runs and ends in its final state', async ({ page }) => {
    await page.goto('/long-task');

    const sse = page.waitForResponse(
      (r) => r.url().includes('/mateu/v3/sse/') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Run long task' }).click();

    const response = await sse;
    expect(response.headers()['content-type']).toContain('text/event-stream');

    // a blocking task: a modal with the task's title and a progress bar
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Processing', { exact: true })).toBeVisible();
    // …showing an INTERMEDIATE step before the end: proof the increments are streamed, not
    // delivered all together when the task is over.
    await expect(dialog.getByText(/^Step [1-4] of 5$/)).toBeVisible();

    // final state: the done title and text, and a full bar
    await expect(dialog.getByText('Long task finished', { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText('All 5 steps processed', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    // a progress step is no page: the window title stays the screen's
    await expect(page).toHaveTitle('Long task');
  });

  test('a background task lives in the task center and can be cancelled', async ({ page }) => {
    await page.goto('/long-task');
    await page.getByRole('button', { name: 'Run in background' }).click();

    // no modal: the indicator counts it, and the page stays usable
    const indicator = page.getByRole('button', { name: /Show tasks, 1 running/ });
    await expect(indicator).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await indicator.click();
    const list = page.getByRole('region', { name: 'Tasks' });
    await expect(list.getByText('Syncing catalogue')).toBeVisible();
    await expect(list.getByText(/of 1000/)).toBeVisible();

    await list.getByRole('button', { name: 'Cancel' }).click();
    await expect(list.getByText('Cancelled')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Show tasks, 1 running/ })).toHaveCount(0);
  });

});
