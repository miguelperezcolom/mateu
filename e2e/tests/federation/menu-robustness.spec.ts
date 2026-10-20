import { test, expect, Page, Route } from '@playwright/test';

/**
 * A federated shell's menu when its remotes do not all behave (P9, delivery 1).
 *
 * The shell (fed-shell-app :8084) mounts two remotes: the healthy one (:8085, "Remote") and one
 * nothing listens on (:8099, "Offline"). The browser asks each for its menu and merges the answers.
 *
 * - It used to wait for ALL of them (Promise.all): one remote down left every section a bare
 *   label with nothing under it. Now one remote down is one section down — shown, dimmed, with a
 *   tooltip saying why — and the others are merged.
 * - Before any remote answers, the shell already knows the section a deep link is in (each remote
 *   section travels with the prefix its screens live under), so the first breadcrumb is there on a
 *   cold load instead of appearing once the slowest remote has answered.
 * - The shell declares no variant: AUTO picks MENU_ON_TOP for a shell with remotes, which the
 *   browser used to force. The menu is the same band it always was.
 * - The shell labels its mount ("Remote"), so the remote's entries are grouped under that section
 *   in every variant (#47) — they used to be spliced flat into the band, ignoring the label. Its
 *   screens (Page, Things) are in the section's submenu.
 */
test.describe('federated menu robustness', () => {

  /** Opens the healthy remote's section, once its menu has arrived (it then has a submenu). */
  async function openRemoteSection(page: Page) {
    const section = page.getByRole('menuitem', { name: 'Remote', exact: true });
    await expect(section).toHaveAttribute('aria-haspopup', 'true');
    await section.click();
  }

  test('a remote that is down leaves its section unavailable, and the others merged', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto('/remote/page');

    // the healthy remote's entries were merged, grouped under its section
    await openRemoteSection(page);
    await expect(page.getByRole('menuitem', { name: 'Things' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Page' })).toBeVisible();
    // the dead one is still there, dimmed and not to be opened…
    const offline = page.getByRole('menuitem', { name: 'Offline' });
    await expect(offline).toBeVisible();
    await expect(offline).toHaveClass(/mateu-nav-unavailable/);
    // …and it says why
    await page.keyboard.press('Escape');
    await offline.hover();
    await expect(page.getByText(/Offline (is not available|no está disponible)/)).toBeVisible();
    // the page itself, served by the healthy remote, is unaffected
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('clicking the unavailable section asks its remote again, and does not navigate', async ({ page }) => {
    await page.goto('/remote/page');
    const offline = page.getByRole('menuitem', { name: 'Offline' });
    await expect(offline).toHaveClass(/mateu-nav-unavailable/);

    const asked = page.waitForRequest((request) => request.url().startsWith('http://localhost:8099/offline'));
    await offline.click();
    await asked;

    await expect(page).toHaveURL(/\/remote\/page$/);
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();
  });

  test('on a cold load the section is known before its remote answers', async ({ page }) => {
    // Hold the browser's request for the healthy remote's MENU (not the page's own load): until it
    // is let go, all the shell has is its placeholder for the section.
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

    // the first breadcrumb is the section the shell declared, with no remote menu yet
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(trail).toContainText('Remote');
    await expect(page.getByRole('menuitem', { name: 'Things' })).toHaveCount(0);
    // …and the section has nothing under it yet
    await expect(page.getByRole('menuitem', { name: 'Remote', exact: true })).not.toHaveAttribute('aria-haspopup', 'true');

    release();

    // the menu arrives (in the section's submenu); the page is not reloaded for it
    await openRemoteSection(page);
    await expect(page.getByRole('menuitem', { name: 'Things' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Remote Page' })).toBeVisible();
  });

  test('a shell that declares no variant is still drawn with the menu on top', async ({ page }) => {
    await page.goto('/remote/page');
    await expect(page.locator('mateu-app .mateu-app-band2')).toBeVisible();
    await openRemoteSection(page);
    await expect(page.getByRole('menuitem', { name: 'Things' })).toBeVisible();
  });

});
