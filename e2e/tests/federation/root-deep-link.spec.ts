import { test, expect } from '@playwright/test';

/**
 * Real two-process federation e2e: the shell (fed-shell-app :8084) aggregates the remote
 * (fed-remote-app :8085) via RemoteMenu over HTTP. This exercises the SERVER-TO-SERVER remote
 * resolution (real MateuHttpClient), which the in-JVM RemoteMenuRootDeepLinkSyncTest can only fake.
 *
 * Regression guard for the root-deep-link bug: entering the remote's root by URL (the shell menu
 * path "/remote", which coincides with the remote's own @UI("/remote") route) must mount the
 * remote's HOME CONTENT within the shell. The bug mounted route ""/consumedRoute "_empty" (or a
 * "_no_home_route" marker), which makes the remote answer with its WHOLE app shell — its chrome and
 * menu nested inside the shell — and navigating that nested app loops the server forever.
 */

const ROOT_API = '/mateu/v3/components/_/action';

async function callAction(request: any, body: object) {
  const response = await request.post(ROOT_API, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  // WebFlux would serialize Flux as an array; MVC returns an object — normalize.
  return Array.isArray(json) ? json[0] : json;
}

/** Find the App metadata (has a menu / home* wiring) anywhere in a fragment component tree. */
function findApp(component: any): any {
  if (!component) return null;
  const md = component.metadata;
  if (md && (md.menu !== undefined || md.homeRoute !== undefined)) return md;
  for (const child of component.children ?? []) {
    const found = findApp(child);
    if (found) return found;
  }
  return null;
}

function appOf(increment: any): any {
  for (const fragment of increment.fragments ?? []) {
    const app = findApp(fragment.component);
    if (app) return app;
  }
  return null;
}

test.describe('RemoteMenu root deep-link (federation)', () => {

  test('deep-linking the remote root mounts home content, not a nested app shell', async ({ request }) => {
    const increment = await callAction(request, {
      route: '/remote',
      consumedRoute: '_empty',
      actionId: '',
    });

    const app = appOf(increment);
    expect(app, 'the shell response should carry an App with a home mount').not.toBeNull();

    // The remote is mounted server-to-server at its absolute base URL.
    expect(app.homeBaseUrl).toBe('http://localhost:8085/remote');

    // The frontend must load a REAL remote route. The bug produced "_no_home_route"/""/"_page",
    // which loads the remote's whole app shell (nested chrome) and loops.
    expect(['_no_home_route', '', '_page'], 'must not be an unresolved-home marker')
      .not.toContain(app.homeRoute);

    // Consuming the shell menu path renders the remote's home content.
    expect(app.homeRoute).toBe('/remote');
    expect(app.homeConsumedRoute).toBe('/remote');
  });

  test('repeated deep-links resolve identically (no drift / no accumulation)', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const app = appOf(await callAction(request, {
        route: '/remote',
        consumedRoute: '_empty',
        actionId: '',
      }));
      expect(app?.homeRoute).toBe('/remote');
      expect(app?.homeConsumedRoute).toBe('/remote');
    }
  });

});
