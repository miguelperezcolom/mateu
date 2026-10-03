import { test, expect, Route } from '@playwright/test';

/**
 * HAMBURGER_SECTIONS (P9, delivery 2), Opera Cloud's navigation, on a federated shell.
 *
 * The shell (fed-sections-app :8087) has three sections: «Remote», mounted from the healthy remote
 * (:8085), which answers with two entries; «Reports», local, with a group in it; and «Offline», a
 * remote nothing listens on (:8099).
 *
 * - The hamburger holds the sections, and only them.
 * - The band under the header holds the entries of the section on screen; a group is a dropdown.
 * - Choosing a section goes to its home, its first entry.
 * - The section on screen comes from the route, so it is known on a cold load before its remote
 *   has answered.
 * - A remote that is down disables its own section and nothing else.
 */
const hamburger = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^(Sections|Secciones)$/ });
const panel = (page: import('@playwright/test').Page) => page.locator('#mateu-sections-panel');
const band = (page: import('@playwright/test').Page) => page.locator('nav.mateu-section-band');

test.describe('HAMBURGER_SECTIONS', () => {

  test('the hamburger holds the sections; the band, the entries of the one on screen', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto('/remote/page');
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();

    // band 2: the section's name and its entries (the remote's two, under the shell's label)
    await expect(band(page).locator('.mateu-section-title')).toHaveText('Remote');
    await expect(band(page).getByRole('menuitem', { name: 'Page' })).toBeVisible();
    await expect(band(page).getByRole('menuitem', { name: 'Things' })).toBeVisible();
    // the entry on screen is marked
    await expect(band(page).getByRole('menuitem', { name: 'Page' })).toHaveClass(/mateu-nav-active/);

    // the hamburger: the sections, nothing below them
    await expect(panel(page)).toHaveCount(0);
    await hamburger(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).locator('.mateu-section-link')).toHaveText(['Remote', 'Reports', 'Offline']);
    await expect(panel(page).getByRole('button', { name: 'Remote' })).toHaveAttribute('aria-current', 'page');
    await expect(panel(page).getByRole('button', { name: 'Things' })).toHaveCount(0);

    // Escape closes it
    await page.keyboard.press('Escape');
    await expect(panel(page)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('choosing a section goes to its home, and the band follows', async ({ page }) => {
    await page.goto('/remote/page');
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();

    await hamburger(page).click();
    await panel(page).getByRole('button', { name: 'Reports' }).click();

    // its first entry, and the panel closes
    await expect(page).toHaveURL(/\/reports\/summary$/);
    await expect(page.getByRole('heading', { name: 'Summary report' })).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
    await expect(band(page).locator('.mateu-section-title')).toHaveText('Reports');
    await expect(band(page).getByRole('menuitem', { name: 'Summary' })).toHaveClass(/mateu-nav-active/);

    // the third level: a group of the band is a dropdown
    await band(page).getByRole('menuitem', { name: 'Archive' }).click();
    await page.getByRole('menuitem', { name: 'Monthly' }).click();
    await expect(page).toHaveURL(/\/reports\/archive\/monthly$/);
    await expect(page.getByRole('heading', { name: 'Monthly report' })).toBeVisible();
    await expect(band(page).getByRole('menuitem', { name: 'Archive' })).toHaveClass(/mateu-nav-active/);
  });

  test('a remote that is down disables its section only', async ({ page }) => {
    await page.goto('/reports/summary');
    await expect(page.getByRole('heading', { name: 'Summary report' })).toBeVisible();
    await hamburger(page).click();
    const offline = panel(page).getByRole('button', { name: 'Offline' });
    await expect(offline).toHaveClass(/mateu-nav-unavailable/);
    await expect(offline).toHaveAttribute('title', /Offline (is not available|no está disponible)/);
    await expect(panel(page).getByRole('button', { name: 'Remote' })).not.toHaveClass(/mateu-nav-unavailable/);

    // choosing it asks its remote again, and goes nowhere
    const asked = page.waitForRequest((request) => request.url().startsWith('http://localhost:8099/offline'));
    await offline.click();
    await asked;
    await expect(page).toHaveURL(/\/reports\/summary$/);
  });

  test('on a cold load the section is known before its remote answers', async ({ page }) => {
    // Hold the browser's request for the remote's MENU: until it is let go the shell has only its
    // placeholder for the section.
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route('http://localhost:8085/**', async (route: Route) => {
      const body = route.request().postData() || '';
      if (body.includes('"initiatorComponentId":"http://localhost:8085/remote#')) {
        await held;
      }
      await route.continue();
    });

    await page.goto('/remote/page');
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();
    // the band already names the section, from the route's prefix
    await expect(band(page).locator('.mateu-section-title')).toHaveText('Remote');
    await expect(band(page).getByRole('menuitem', { name: 'Page' })).toHaveCount(0);
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(trail).toContainText('Remote');

    release();

    // the entries arrive under it; the page is not reloaded for them
    await expect(band(page).getByRole('menuitem', { name: 'Page' })).toHaveClass(/mateu-nav-active/);
    await expect(band(page).getByRole('menuitem', { name: 'Things' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();
  });
});
