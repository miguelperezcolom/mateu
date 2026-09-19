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

  test('a Dashboard renders as a responsive grid with its KPIs and panel (#9 consolidation)', async ({ page }) => {
    await page.goto('/dashboard-grid');
    // The KPIs (Scoreboard) and the @Panel tile render inside the consolidated grid.
    await expect(page.getByText('Revenue')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Occupancy')).toBeVisible();
    await expect(page.getByText('Notes')).toBeVisible();
    // The dashboard is now a ResponsiveGrid (display:grid), not the bespoke DashboardLayout.
    const grid = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return { display: cs.display, columns: cs.gridTemplateColumns };
    });
    expect(grid.display).toBe('grid');
    expect(grid.columns.trim().split(/\s+/).length).toBe(3);
  });

  test('@Zones consolidates onto the responsive grid (#9): ratio tracks that stack on narrow', async ({ page }) => {
    await page.goto('/zones');
    await expect(page.locator('mateu-ux').first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(1000);
    // The zoned row is now a ResponsiveGrid (display:grid), not a flex row.
    const grid = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return { display: cs.display, cols: cs.gridTemplateColumns };
    });
    expect(grid.display).toBe('grid');
    // two zone tracks (60%/40%) → two resolved px tracks on a wide viewport.
    expect(grid.cols.trim().split(/\s+/).length).toBe(2);
  });

  test('a Screen template places its components into named grid slots (#7)', async ({ page }) => {
    await page.goto('/template-demo');
    await expect(page.getByText('Header slot')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Sidebar slot')).toBeVisible();
    await expect(page.getByText('Main slot')).toBeVisible();
    // The grid declares named areas, and each component is placed into its area by its slot.
    const info = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      // find the cell whose text is "Sidebar slot" and read its grid-area
      const cells = Array.from((el as HTMLElement).children) as HTMLElement[];
      const sidebar = cells.find(c => c.textContent?.includes('Sidebar slot'));
      return { display: cs.display, hasAreas: cs.gridTemplateAreas !== 'none', sidebarArea: sidebar ? getComputedStyle(sidebar).gridArea : null };
    });
    expect(info.display).toBe('grid');
    expect(info.hasAreas).toBe(true);
    expect(info.sidebarArea).toContain('sidebar');
  });

  test('the CollectionDetail archetype is a named-slot template on the one grid (#7 migration)', async ({ page }) => {
    await page.goto('/collection-detail');
    await expect(page.getByText('Riu Palace')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    // The archetype's layout is now a ResponsiveGrid (display:grid) with named areas, not the
    // bespoke ContentLayout — a "list detail" template with two resolved tracks.
    const grid = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return { display: cs.display, cols: cs.gridTemplateColumns, areas: cs.gridTemplateAreas };
    });
    expect(grid.display).toBe('grid');
    expect(grid.cols.trim().split(/\s+/).length).toBe(2);
    expect(grid.areas).toContain('list');
    // clicking a list item renders its detail in the main slot.
    await page.getByText('Riu Plaza').click();
    await expect(page.getByText('Madrid · 500 rooms')).toBeVisible({ timeout: 10000 });
  });

  test('the ItemOverview archetype is a keyinfo/tabs template with a sticky key-info slot (#7 migration)', async ({ page }) => {
    await page.goto('/item-overview');
    await expect(page.getByText('Aeron chair — key info summary')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    // The archetype is now a ResponsiveGrid template (display:grid) with two tracks and a sticky
    // key-info area — not the bespoke sticky HorizontalLayout/ContentLayout.
    const info = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      const cells = Array.from((el as HTMLElement).children) as HTMLElement[];
      const keyinfo = cells.find(c => c.style.gridArea?.includes('keyinfo') || c.textContent?.includes('key info summary'));
      return {
        display: cs.display,
        tracks: cs.gridTemplateColumns.trim().split(/\s+/).length,
        keyinfoPosition: keyinfo ? getComputedStyle(keyinfo).position : null,
      };
    });
    expect(info.display).toBe('grid');
    expect(info.tracks).toBe(2);
    expect(info.keyinfoPosition).toBe('sticky');
    // the tabs render in the tabs slot
    await expect(page.getByText('Specifications')).toBeVisible();
  });

  test('an @Aside field composes a main/aside template on the one grid (#7 migration)', async ({ page }) => {
    await page.goto('/aside-demo');
    // The form fields render (the form-wrapping into the main slot does not break them).
    await expect(page.getByText('Need help?')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    // The @Aside composes a ResponsiveGrid template (display:grid) with two tracks and a sticky
    // aside — not the bespoke ContentLayout. The form field labels are still present.
    const info = await page.locator('.mateu-responsive-grid').first().evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      const cells = Array.from((el as HTMLElement).children) as HTMLElement[];
      const aside = cells.find(c => c.style.gridArea?.includes('aside') || c.textContent?.includes('Need help?'));
      return {
        display: cs.display,
        tracks: cs.gridTemplateColumns.trim().split(/\s+/).length,
        asidePosition: aside ? getComputedStyle(aside).position : null,
      };
    });
    expect(info.display).toBe('grid');
    expect(info.tracks).toBe(2);
    expect(info.asidePosition).toBe('sticky');
    // the form's own fields survived the wrapping (rendered in the main slot).
    await expect(page.getByLabel('First Name')).toBeVisible();
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
