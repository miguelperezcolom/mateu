import { test, expect } from '@playwright/test';

// "Still loading" and "found nothing" are different facts, and a listing used to report both with
// the same words — the empty state. It shows up on every search, too, because a re-search clears
// the rows it is about to replace. So the reader is told there is nothing there at the exact moment
// the answer is on its way.
test.describe('listing loading state', () => {

  const skeletonShown = (page: any) => page.evaluate(() => {
    const deep = (root: Document | ShadowRoot): boolean => {
      for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.tagName.toLowerCase() === 'mateu-skeleton') return true;
        if (el.shadowRoot && deep(el.shadowRoot)) return true;
      }
      return false;
    };
    return deep(document);
  });

  test('says it is loading rather than that there is nothing', async ({ page }) => {
    // Hold the search back, the way a slow backend does. Without this the answer arrives too fast
    // for the state to be observable — which is why nobody noticed it was wrong.
    await page.route('**/mateu/v3/**', async (route) => {
      if ((route.request().postData() || '').includes('"search"')) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      await route.continue();
    });

    await page.goto('/simple-listing');
    await page.waitForTimeout(900);

    expect(await skeletonShown(page)).toBe(true);
    await expect(page.getByText('Nothing here yet.')).toHaveCount(0);

    // And it gives way to the rows once they arrive.
    await page.waitForTimeout(2500);
    expect(await skeletonShown(page)).toBe(false);
  });

  test('and still says there is nothing when a search really finds nothing', async ({ page }) => {
    await page.goto('/simple-listing');
    await expect(page.locator('vaadin-grid').first()).toBeAttached();
    await page.waitForTimeout(800);

    // The listing filters by its search text, so this one genuinely has no rows to show.
    const search = page.locator('input[type="search"], mateu-filter-bar input').first();
    await search.fill('zzzz');
    await search.press('Enter');

    await expect(page.getByText('Nothing here yet.')).toBeVisible({ timeout: 10000 });
    expect(await skeletonShown(page)).toBe(false);
  });

});
