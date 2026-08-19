import { test, expect } from '@playwright/test';

// A view that refreshes itself answers with a State: values, no component tree. Everything a
// custom element receives arrives as part of that tree, so a literal attribute stops following
// what it shows the moment the page starts refreshing itself — the element keeps drawing, with
// the data it had when it was first rendered, which looks exactly like working.
test.describe('LiveElementForm (/live-element)', () => {

  test('an element attribute written as an expression follows a State refresh', async ({ page }) => {
    await page.goto('/live-element');

    const graph = page.locator('live-graph');
    await expect(graph).toHaveAttribute('overlay', 'one');

    await page.getByRole('button', { name: 'Advance' }).click();

    await expect(graph).toHaveAttribute('overlay', 'two');
  });

  test('the refresh updates the element instead of replacing it', async ({ page }) => {
    // The distinction that decides whether this is a fix or a different bug: a real component
    // rebuilt on every refresh would lose what it holds and the server knows nothing about — a
    // zoom, a selection, a computed layout. Marking the node is the only way to tell from outside,
    // since a replacement is invisible in the rendered page.
    await page.goto('/live-element');

    const graph = page.locator('live-graph');
    await expect(graph).toHaveAttribute('overlay', 'one');
    await graph.evaluate((el: any) => { el.__survivedTheRefresh = true });

    await page.getByRole('button', { name: 'Advance' }).click();
    await expect(graph).toHaveAttribute('overlay', 'two');

    expect(await graph.evaluate((el: any) => el.__survivedTheRefresh === true)).toBe(true);
  });

});
