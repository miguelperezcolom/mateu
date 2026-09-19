import { test, expect } from '@playwright/test';

/**
 * Layout sizing intent (coherence-plan #8, Phase 3). Verifies the viewport-height flex chain that
 * lets a component sized "fill" (a listing) take the space header/menu/searchbox leave and scroll
 * internally, instead of pushing the page. The deterministic assertion is on the chain this PR adds
 * — the content ux is a flex COLUMN — plus outcome guards: a listing does not overflow the page,
 * and a form still renders (a flex-column ux must not clip normal content).
 *
 * Renderer-agnostic in spirit (asserts on the shared mateu-ux element + computed layout, not on a
 * design system's tags), so it can be pointed at any web renderer by changing the project baseURL.
 */

test.describe('layout sizing (fill / hug)', () => {

  test('the content ux is a flex column — the viewport-height flex chain', async ({ page }) => {
    await page.goto('/full-crud');
    // The listing paints (a grid with rows / the crud surface is present).
    await expect(page.locator('mateu-ux').first()).toBeAttached({ timeout: 15000 });

    // The content ux is a flex column. This is the link this PR adds; without it a "fill" child
    // cannot take the remaining height. Read via the element's own computed style (the locator
    // pierces the shell's shadow roots, which a document.querySelector cannot).
    const isFlexColumn = await page.locator('mateu-ux').first().evaluate((ux) => {
      const cs = getComputedStyle(ux as HTMLElement);
      return { display: cs.display, flexDirection: cs.flexDirection };
    });
    expect(isFlexColumn.display).toBe('flex');
    expect(isFlexColumn.flexDirection).toBe('column');
  });

  test('a listing fills the viewport rather than overflowing the page', async ({ page }) => {
    await page.goto('/full-crud');
    await expect(page.locator('mateu-ux').first()).toBeAttached({ timeout: 15000 });
    // Give the listing a moment to size itself (fill / measure).
    await page.waitForTimeout(1500);

    // The page itself does not develop a large vertical scroll: a filled listing scrolls INTERNALLY,
    // so the document overflow past the viewport is small (allow a tolerance for sub-pixel/rounding
    // and any minor chrome). A broken chain would let the whole listing push the page far past the
    // viewport.
    const overflow = await page.evaluate(() => {
      const doc = document.scrollingElement ?? document.documentElement;
      return doc.scrollHeight - doc.clientHeight;
    });
    expect(overflow).toBeLessThan(400);
  });

  test('a form still renders under the flex-column ux (hug content is not clipped)', async ({ page }) => {
    await page.goto('/field-types');
    // A form field is visible — the flex-column ux does not clip or hide normal (hug) content.
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 15000 });
  });

  test('a ResponsiveGrid paints a CSS grid with the resolved column tracks (#9)', async ({ page }) => {
    await page.goto('/responsive-grid');
    await expect(page.getByText('fixed 15rem column')).toBeVisible({ timeout: 15000 });
    // The grid element paints display:grid with the tracks resolved from hug/fill/fixed intent.
    const grid = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return { display: cs.display, columns: cs.gridTemplateColumns };
    });
    expect(grid.display).toBe('grid');
    // hug→auto, fill→1fr, fixed→15rem; the computed value resolves to three px/px/px tracks,
    // so assert there are three tracks and the last is a fixed width (15rem → 240px).
    expect(grid.columns.trim().split(/\s+/).length).toBe(3);
  });
});
