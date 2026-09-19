import { test, expect } from '@playwright/test';

/**
 * CHARACTERIZATION + TARGET GUARD for the "cold-load flicker" on a CRUD RECORD deep-link.
 *
 * Symptom (reported on the EventConductor demo, ec1.mateu.io): opening/reloading a process —
 * a RECORD inside a listing, URL `/workflow/processes/{uuid}` — shows a brief "reload effect":
 * the content area repaints in stages. It is NOT a "Not found" (no such text reaches the DOM or
 * the wire) and NOT a failed request — every load is 200.
 *
 * What it actually is (proven, 2026-09-12): a deep-link to a record of a CRUD/Navigable loads the
 * SAME route in THREE sequential phases, and each phase paints:
 *   1) the App shell structure,
 *   2) the listing/CRUD (ServerSide),
 *   3) the record detail (ServerSide, carries SetWindowTitle).
 *
 * DECISIVE finding: this is NOT a shell/federation bug. Hitting the remote CRUD DIRECTLY, with no
 * shell in front (`http://localhost:8085/remote/things/t3`), also produced 3 loads of the route.
 * So the multi-phase cold-load is inherent to CRUD record deep-links across all of Mateu; the
 * federation/shell path only adds its own top <mateu-ux> on top of that.
 *
 * This file pins the behaviour two ways:
 *   - `counts the loads of a record deep-link route` — a PASSING characterization that records how
 *     many times the record route is loaded today (no assertion on the exact number, so it never
 *     goes stale). Run it to see the current count in the attached annotation / console.
 *   - `a record deep-link loads its route once` — the TARGET, marked test.fixme so CI does not fail
 *     on the known issue. When the CRUD cold-load is collapsed (see
 *     doc/.../crud-record-deeplink-multiload.md for where and the risks), drop `.fixme` and it
 *     becomes the regression guard.
 *
 * Topology: the shell (fed-shell-app :8084) aggregates the remote (:8085) via RemoteMenu; the
 * remote declares a Navigable listing `RemoteThings` at `/remote/things`, so `/remote/things/t3`
 * is a record deep-link — the exact shape of `/workflow/processes/{uuid}`.
 */

/** POSTs that load the remote's OWN content route (the listing/record), i.e. the flickering loads. */
const RECORD_ROUTE = /\/mateu\/v3\/sync\/things\/t3\b/;

function countRecordLoads(page: import('@playwright/test').Page): { get(): number } {
  let n = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && RECORD_ROUTE.test(request.url())) n++;
  });
  return { get: () => n };
}

test.describe('CRUD record deep-link cold-load (flicker characterization)', () => {

  test('counts the loads of a record deep-link route', async ({ page }, testInfo) => {
    const loads = countRecordLoads(page);

    await page.goto('/remote/things/t3');
    // The record view only appears once the remote has answered — wait on it, not on a clock.
    await expect(page.getByRole('heading', { name: 'Remote Thing' })).toBeVisible();
    // Let any trailing re-load settle so the count is stable.
    await page.waitForTimeout(1500);

    // No assertion on the exact number (it must not go stale as the engine improves); the value is
    // recorded so a reader sees today's behaviour. As of 2026-09-12 this is > 1 (observed 3 direct /
    // 2–3 behind the shell) — that surplus IS the flicker.
    testInfo.annotations.push({ type: 'record-route-loads', description: String(loads.get()) });
    expect(loads.get()).toBeGreaterThan(0);
  });

  // TARGET: a record deep-link should resolve its content in a single load (one paint, no flicker).
  // Marked fixme because it fails today BY DESIGN of the current CRUD cold-load; it is the guard a
  // future engine fix must turn green. Removing `.fixme` without the fix will (correctly) fail CI.
  test.fixme('a record deep-link loads its route once (no staged repaint / flicker)', async ({ page }) => {
    const loads = countRecordLoads(page);

    await page.goto('/remote/things/t3');
    await expect(page.getByRole('heading', { name: 'Remote Thing' })).toBeVisible();
    await page.waitForTimeout(1500);

    // One authoritative load for the record. (If a master-detail layout legitimately needs the
    // listing too, relax to `toBeLessThanOrEqual(2)` — but never the 3 that reads as a reload.)
    expect(loads.get()).toBe(1);
  });

});
