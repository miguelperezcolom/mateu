import { test, expect } from '@playwright/test';

/**
 * A pasted link to a page INSIDE a remote app — shell + remote menu path + listing + record id.
 *
 * Clicking through the menu works and always did: the shell remembers the base it reached the
 * remote at. Arriving cold does not go through that path, and the app's own metadata says where it
 * lives FROM ITS OWN ORIGIN — which is not where the browser found it. Taking that at face value
 * sent the listing's own load back to the SHELL, which does not serve it: 404 behind a gateway,
 * 405 here. Then the listing's first search recreated the capability bridge from its own class name
 * and died on the target it no longer had.
 */
test.describe('deep link into a remote listing', () => {

  test('loads from the remote, not from the shell', async ({ page }) => {
    const wrongHost: string[] = [];
    page.on('request', (request) => {
      // The remote is :8085. Anything the remote's own components ask for must go there.
      if (request.url().includes('/mateu/v3/') && request.url().includes(':8084')) {
        const body = request.postData() || '';
        if (body.includes('io.mateu.federation.remote')) wrongHost.push(body.slice(0, 120));
      }
    });

    await page.goto('/remote/things/t3');
    // Waiting on the listing itself rather than on a clock: it can only appear once the remote has
    // answered, which is the whole point of the assertions below.
    // By role: the title is also announced in the live region, and matching text alone finds both.
    await expect(page.getByRole('heading', { name: 'Remote Things' })).toBeVisible();
    await expect(page.locator('vaadin-grid').first()).toBeAttached();

    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/Not found|error 40[45]|NullPointerException/i);
    expect(wrongHost).toEqual([]);
  });

  // KNOWN GAP, recorded here rather than in a message that gets lost: the link names a record and
  // lands on the LIST. Route resolution consumes "/things" and the mediator opens on what was
  // consumed, so the "/t3" that identifies the record never reaches the crud's own resolver.
  test.fixme('opens the record the link names, not the list', async ({ page }) => {
    await page.goto('/remote/things/t3');
    await expect(page.getByText('Remote thing t3')).toBeVisible();
  });

});
