import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared helpers (same shape as features.spec.ts)
// ---------------------------------------------------------------------------

async function callAction(request: any, url: string, body: object) {
  const response = await request.post(url, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  return Array.isArray(json) ? json[0] : json;
}

function allNodes(component: any): any[] {
  if (!component) return [];
  const fromChildren = (component?.children ?? []).flatMap(allNodes);
  const fromContent = component?.metadata?.content ? allNodes(component.metadata.content) : [];
  return [component, ...fromChildren, ...fromContent];
}

function fieldIds(fragments: any[]): string[] {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .filter((c: any) => c?.metadata?.type === 'FormField')
    .map((c: any) => c.metadata.fieldId);
}

function pageTitle(fragments: any[]): string | undefined {
  for (const f of fragments) {
    for (const n of allNodes(f.component)) {
      if (n?.metadata?.type === 'Page') return n.metadata.title;
    }
  }
  return undefined;
}

function toolbarActions(fragments: any[]): any[] {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .flatMap((c: any) => c?.metadata?.toolbar ?? []);
}

// ---------------------------------------------------------------------------
// MasterDetailDemo — /master-detail  (MasterDetailView orchestrator)
//
// A MultiView orchestrator: the initial render uses an empty actionId (not
// __load__) plus the serverSideType, like the CRUD orchestrators. The selected
// detail part is encoded in the route as /__md/<key>.
// ---------------------------------------------------------------------------

const MD_API = '/master-detail/mateu/v3/components/_/action';
const MD_TYPE = 'io.mateu.sample1.app.MasterDetailDemo';

function load(request: any, route: string = '/') {
  return callAction(request, MD_API, {
    route, actionId: '', serverSideType: MD_TYPE, consumedRoute: '',
  });
}

test.describe('MasterDetailDemo — MasterDetailView', () => {

  test('initial render shows title "Master Detail Demo" with no errors', async ({ request }) => {
    const body = await load(request);
    expect(pageTitle(body.fragments)).toBe('Master Detail Demo');
    expect(body.messages ?? []).toHaveLength(0);
  });

  test('master section fields are always visible', async ({ request }) => {
    const body = await load(request);
    const ids = fieldIds(body.fragments);
    expect(ids).toContain('order-reference');
    expect(ids).toContain('order-status');
  });

  test('first detail part (Customer) is shown by default; Items is hidden', async ({ request }) => {
    const body = await load(request);
    const ids = fieldIds(body.fragments);
    expect(ids).toContain('customer-name');
    expect(ids).toContain('customer-email');
    expect(ids).not.toContain('items-summary');
    expect(ids).not.toContain('items-total');
  });

  test('a part-selection button is rendered for each detail part', async ({ request }) => {
    const body = await load(request);
    const actions = toolbarActions(body.fragments);
    const byLabel = (l: string) => actions.find((a: any) => a.label === l);
    expect(byLabel('Customer')?.actionId).toBe('__md_pick:customer');
    expect(byLabel('Items')?.actionId).toBe('__md_pick:items');
  });

  test('selecting the Items part via /__md/items shows Items and hides Customer', async ({ request }) => {
    const body = await load(request, '/__md/items');
    const ids = fieldIds(body.fragments);
    // Master stays visible regardless of the selected part.
    expect(ids).toContain('order-reference');
    expect(ids).toContain('items-summary');
    expect(ids).toContain('items-total');
    expect(ids).not.toContain('customer-name');
  });

});
