import { test, expect } from '@playwright/test';

// A running task survives a reload: the tab remembers it (sessionStorage 'mateu-progress-tasks'),
// asks the server which tasks are still there (_progress-tasks) and follows them again
// (_progress-resume) — the task center fills up again. A determinate task also gets the server's
// estimate of the time left once the observed rate makes it honest ("about 5 min left").
test.describe('LongTaskForm (/long-task) — reattach and ETA', () => {

  test('a background task shows its ETA and is still there after a reload', async ({ page }) => {
    await page.goto('/long-task');
    await page.getByRole('button', { name: 'Run in background' }).click();

    const indicator = page.getByRole('button', { name: /Show tasks, 1 running/ });
    await expect(indicator).toBeVisible();
    await indicator.click();
    const list = page.getByRole('region', { name: 'Tasks' });
    await expect(list.getByText('Syncing catalogue')).toBeVisible();

    // 1000 steps of 300 ms: after a couple of seconds the server dares an estimate
    await expect(list.getByText(/about \d+ min left/)).toBeVisible({ timeout: 10_000 });

    // the tab remembers the task for the session
    const remembered = await page.evaluate(() => sessionStorage.getItem('mateu-progress-tasks'));
    expect(remembered).toContain('taskId');

    // reload: the task was not cancelled, and the task center shows it again
    const listed = page.waitForRequest((r) => r.method() === 'POST'
      && (r.postData() ?? '').includes('"_progress-tasks"'))
    const resumed = page.waitForRequest((r) => r.url().includes('/mateu/v3/sse/')
      && (r.postData() ?? '').includes('"_progress-resume"'))
    await page.reload();
    await listed;
    await resumed;

    const again = page.getByRole('button', { name: /Show tasks, 1 running/ });
    await expect(again).toBeVisible({ timeout: 10_000 });
    await again.click();
    const listAgain = page.getByRole('region', { name: 'Tasks' });
    await expect(listAgain.getByText('Syncing catalogue')).toBeVisible();
    // it keeps moving: the resume stream delivers its updates
    const first = await listAgain.getByText(/Synced \d+ items/).textContent();
    await expect(async () => {
      expect(await listAgain.getByText(/Synced \d+ items/).textContent()).not.toEqual(first);
    }).toPass({ timeout: 10_000 });

    // and it can still be cancelled from the reloaded tab
    await listAgain.getByRole('button', { name: 'Cancel' }).click();
    await expect(listAgain.getByText('Cancelled')).toBeVisible({ timeout: 10_000 });
  });

});
