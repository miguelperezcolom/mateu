import { test, expect, type Page } from '@playwright/test';

// The notification inbox on the web renderer, against a server-side inbox (InboxApp, @UI("/inbox"))
// and the things that make an entry arrive while the page is open (InboxDesk): the bell's unread
// count, an entry's detail and its server-side actions, dismiss, dedup, a live push and a
// background task that notifies when done. Shared suite: the live stream has to work on every
// adapter. The inbox is one per server (the SUT has no sign-in), hence serial + a reset per test.
// What a SIGNED-IN caller's inbox stores (InboxStore) has its own tests in core.

const bell = (page: Page) => page.locator('mateu-notification-bell');
const bellButton = (page: Page) => bell(page).getByRole('button', { name: /^Notifications/ });
const filter = (page: Page, name: 'All' | 'Unread' | 'Resolved') =>
  bell(page).getByRole('button', { name, exact: true });

/** Fresh inbox, fresh page: nothing a previous test or a stale fetch left behind. */
async function freshDesk(page: Page) {
  await page.goto('/inbox/desk');
  await page.getByRole('button', { name: 'Reset inbox' }).click();
  await expect(page.getByText('Inbox reset').first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reset inbox' })).toBeVisible();
  await expect(bellButton(page)).toHaveAccessibleName('Notifications, 2 unread');
}

test.describe('Notification inbox (/inbox)', () => {
  test.describe.configure({ mode: 'serial' });

  test('the bell counts what is unread and the panel lists and filters it', async ({ page }) => {
    await freshDesk(page);
    await expect(bell(page).locator('.badge')).toHaveText('2');

    await bellButton(page).click();
    await expect(bell(page).getByRole('heading', { name: 'Approvals' })).toBeVisible();
    for (const title of ['Expense to approve', 'Booking confirmed', 'Backup done']) {
      await expect(bell(page).getByText(title)).toBeVisible();
    }

    await filter(page, 'Unread').click();
    await expect(bell(page).getByText('Expense to approve')).toBeVisible();
    await expect(bell(page).getByText('Backup done')).toHaveCount(0);
  });

  test('opening an entry shows its detail and marks it read', async ({ page }) => {
    await freshDesk(page);
    await bellButton(page).click();
    await bell(page).getByText('Expense to approve').click();

    await expect(page.getByText('Expense e1')).toBeVisible();
    await expect(page.getByText('Paid with the company card')).toBeVisible();
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 1 unread');

    // read on the server too, not only on this page
    await page.reload();
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 1 unread');
  });

  test('a server-side action runs on the entry and resolves it', async ({ page }) => {
    await freshDesk(page);
    await bellButton(page).click();
    await bell(page).getByRole('button', { name: 'Approve', exact: true }).click();

    await expect(page.getByText('Expense approved').first()).toBeVisible();
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 1 unread');

    // resolved: out of the pending work, kept under Resolved, nothing left to run
    await expect(bell(page).getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
    await filter(page, 'Unread').click();
    await expect(bell(page).getByText('Expense to approve')).toHaveCount(0);
    await filter(page, 'Resolved').click();
    await expect(bell(page).getByText('Expense to approve')).toBeVisible();
    await expect(bell(page).locator('.entry-resolved')).toHaveText('Resolved');
  });

  test('dismissing an entry removes it for good', async ({ page }) => {
    await freshDesk(page);
    await bellButton(page).click();
    // the bell drops it at once; a reload before the server has heard would bring it back
    const answered = page.waitForResponse((r) => (r.request().postData() ?? '').includes('_notifications-dismiss'));
    await bell(page).getByRole('button', { name: 'Dismiss: Booking confirmed' }).click();
    await answered;

    await expect(bell(page).getByText('Booking confirmed')).toHaveCount(0);
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 1 unread');

    await page.reload();
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 1 unread');
    await bellButton(page).click();
    await expect(bell(page).getByText('Expense to approve')).toBeVisible();
    await expect(bell(page).getByText('Booking confirmed')).toHaveCount(0);
  });

  test('the same key makes one entry, however many messages carry it', async ({ page }) => {
    await freshDesk(page);
    const save = page.getByRole('button', { name: 'Save draft' });
    await save.click();
    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 3 unread');
    await save.click();
    // the second answer has landed when its toast is on screen next to the first one
    await expect(page.getByText('Draft saved')).toHaveCount(2);

    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 3 unread');
    await bellButton(page).click();
    await expect(bell(page).getByText('Draft saved')).toHaveCount(1);
  });

  test('an entry pushed live reaches the bell with no reload', async ({ page, browser }) => {
    await freshDesk(page);
    await page.evaluate(() => { (window as unknown as { __notReloaded: boolean }).__notReloaded = true; });

    // the push comes from somewhere else: another browser session, not this tab
    const context = await browser.newContext();
    const other = await context.newPage();
    try {
      await other.goto('/inbox/desk');
      const publish = other.getByRole('button', { name: 'Publish live' });

      // the stream is opened by the page load and subscribes a moment after its first event: a
      // publish before that is lost, so publish until one lands (same id, so they make one entry)
      await expect(async () => {
        await publish.click();
        await expect(bellButton(page)).toHaveAccessibleName('Notifications, 3 unread', { timeout: 1_000 });
      }).toPass({ timeout: 15_000 });

      // announced on the page that received it
      await expect(page.getByText('Server restarted').first()).toBeVisible();
      await bellButton(page).click();
      await expect(bell(page).getByText('Server restarted')).toHaveCount(1);

      // published again with the same id: it replaces the entry, it does not add one
      const firstText = await bell(page).getByText(/^Back online #/).textContent();
      await publish.click();
      await expect(bell(page).getByText(/^Back online #/)).not.toHaveText(firstText ?? '');
      await expect(bell(page).getByText('Server restarted')).toHaveCount(1);
      await expect(bellButton(page)).toHaveAccessibleName('Notifications, 3 unread');

      expect(await page.evaluate(() => (window as unknown as { __notReloaded?: boolean }).__notReloaded)).toBe(true);
    } finally {
      await context.close();
    }
  });

  test('a background task that notifies when done leaves an entry in the inbox', async ({ page }) => {
    await freshDesk(page);
    await page.getByRole('button', { name: 'Export in background' }).click();

    // it runs in the task center, with no modal, and the page stays usable
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await expect(bellButton(page)).toHaveAccessibleName('Notifications, 3 unread', { timeout: 15_000 });
    await bellButton(page).click();
    await expect(bell(page).getByText('Export finished')).toBeVisible();
    await expect(bell(page).getByText('120 rows written')).toBeVisible();
  });
});
