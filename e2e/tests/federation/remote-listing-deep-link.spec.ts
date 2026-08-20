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
    // Waiting on the page itself rather than on a clock: it can only appear once the remote has
    // answered, which is what the assertions below are about. By ROLE, because the title is also
    // announced in the live region and matching the text alone finds both.
    await expect(page.getByRole('heading', { name: 'Remote Thing' })).toBeVisible();

    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/Not found|error 40[45]|NullPointerException/i);
    expect(wrongHost).toEqual([]);
  });

  test('opens the record the link names, not the list', async ({ page }) => {
    // Route resolution consumes "/things" and hands the mediator what it consumed; the "/t3" that
    // identifies the record has to survive that hand-off, or a link to one record shows all of them.
    await page.goto('/remote/things/t3');

    await expect(page.getByRole('heading', { name: 'Remote Thing' })).toBeVisible();
    // The record's own values, which only the record's own view can produce — the list has none of
    // them. They are rendered as fields, so this reads the inputs rather than the page text.
    await expect(page.locator('vaadin-text-field input').first()).toHaveValue('t3');
    await expect(page.locator('vaadin-text-field input').nth(1)).toHaveValue('Remote thing t3');
  });

});
