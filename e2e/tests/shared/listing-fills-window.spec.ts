import { test, expect } from '@playwright/test';

// A listing box was capped (`max-height`) but never stretched: with no definite height above it,
// it was as tall as its content, and its content was a grid at the 400px vaadin-grid defaults to.
// The table stopped a third of the way down the window with the space below it empty, and scrolled
// inside those 400px as soon as a page of rows did not fit.
test.describe('listing layout', () => {

  const gridBox = (page: any) => page.evaluate(() => {
    const find = (root: Document | ShadowRoot): Element | null => {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.tagName.toLowerCase() === 'vaadin-grid') return el;
        if (el.shadowRoot) { const found = find(el.shadowRoot); if (found) return found; }
      }
      return null;
    };
    const grid = find(document);
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    return {
      height: Math.round(rect.height),
      spaceBelow: Math.round(window.innerHeight - rect.bottom),
      viewport: window.innerHeight,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  });

  test('the table fills the window instead of stopping at a fixed height', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('vaadin-grid').first()).toBeAttached();
    await page.waitForTimeout(800);

    const box = await gridBox(page);
    // What is left under the table is the pagination row and a small gutter — not a third of the
    // window. The pre-fix number here was ~350px of nothing on a 900px-tall window.
    expect(box.spaceBelow).toBeLessThan(120);
    expect(box.height).toBeGreaterThan(420);
  });

  test('and does not make the window scroll for a sliver', async ({ page }) => {
    // Filling to the window's bottom edge is only right if what the shell keeps UNDER the listing
    // is counted — its gap, its padding. Otherwise the page grows a scrollbar for a few pixels.
    await page.goto('/products');
    await expect(page.locator('vaadin-grid').first()).toBeAttached();
    await page.waitForTimeout(800);

    expect((await gridBox(page)).pageScrolls).toBe(false);
  });

  test('and follows the window when it is resized', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('vaadin-grid').first()).toBeAttached();
    await page.waitForTimeout(800);
    const tall = await gridBox(page);

    await page.setViewportSize({ width: 1280, height: 560 });
    await page.waitForTimeout(800);
    const short = await gridBox(page);

    expect(short.height).toBeLessThan(tall.height);
    expect(short.spaceBelow).toBeLessThan(120);
    expect(short.pageScrolls).toBe(false);
  });

});
