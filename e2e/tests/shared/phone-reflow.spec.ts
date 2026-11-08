import { test, expect } from '@playwright/test';

/**
 * UX review W-V-REFLOW-2 (WCAG 1.4.10 Reflow): at phone width nothing may push the page sideways.
 *
 * Two shapes still did after the first reflow pass: a form's row of buttons (they never wrapped —
 * "Delete with confirm" ended past the screen edge on /action-features) and a `@FoldedLayout`
 * (/accordion, /folded), whose section columns sat side by side with no floor, so the second one
 * was cut off. The row now wraps and each folded column drops below the previous one under 20rem.
 */

/** The rightmost edge of any rendered element, walking open shadow roots (every control lives in one). */
const rightmostEdge = async (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
        let max = 0;
        const walk = (root: ParentNode) => {
            for (const el of root.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                const cs = getComputedStyle(el);
                if (r.width > 0 && r.height > 0 && cs.position !== 'fixed' && cs.visibility !== 'hidden') {
                    max = Math.max(max, r.right);
                }
                const shadow = (el as HTMLElement).shadowRoot;
                if (shadow) walk(shadow);
            }
        };
        walk(document);
        return max;
    });

for (const route of ['/action-features', '/accordion', '/folded']) {
    test(`${route} does not scroll sideways at 390px`, async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(route);
        await expect(page.locator('mateu-page, mateu-form').first()).toBeVisible();
        await page.waitForTimeout(500);
        expect(await page.evaluate(() =>
            document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
        expect(await rightmostEdge(page)).toBeLessThanOrEqual(392);
    });
}
