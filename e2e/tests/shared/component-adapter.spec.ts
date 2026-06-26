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

function allFields(fragments: any[]): any[] {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .filter((c: any) => c?.metadata?.type === 'FormField')
    .map((c: any) => c.metadata);
}

// An adapted view carries its page title on the Page node, not as a
// SetWindowTitle command (the adapter builds the component tree directly).
function pageTitle(fragments: any[]): string | undefined {
  for (const f of fragments) {
    for (const n of allNodes(f.component)) {
      if (n?.metadata?.type === 'Page') return n.metadata.title;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// AdapterDemo — /adapter-demo  (ComponentAdapter SPI)
//
// AdapterDemo is a plain POJO with no Mateu form annotations; AdapterDemoAdapter
// (a framework bean: @Service on Spring, @ApplicationScoped on Quarkus,
// @Singleton on Micronaut) teaches Mateu how to render it and rebuild it from
// the returned state. This spec runs against all four adapters.
// ---------------------------------------------------------------------------

const ADAPTER_API = '/adapter-demo/mateu/v3/components/_/action';
const ADAPTER_TYPE = 'io.mateu.sample1.app.AdapterDemo';

test.describe('AdapterDemo — ComponentAdapter SPI', () => {

  test('load renders the adapted view title "Product (adapted)"', async ({ request }) => {
    const body = await callAction(request, ADAPTER_API, { route: '/', actionId: '__load__' });
    expect(pageTitle(body.fragments)).toBe('Product (adapted)');
    expect(body.messages ?? []).toHaveLength(0);
  });

  test('adapter-defined fields are rendered with their labels', async ({ request }) => {
    const body = await callAction(request, ADAPTER_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);
    expect(byId('code')?.label).toBe('Code');
    expect(byId('name')?.label).toBe('Name');
    expect(byId('quantity')?.label).toBe('Quantity');
  });

  test('initial field initializers seed the view (code=SKU-001)', async ({ request }) => {
    const body = await callAction(request, ADAPTER_API, { route: '/', actionId: '__load__' });
    // The adapter mirrors the model state under field ids; state rides on the fragment.
    const state = body.fragments[0]?.state ?? {};
    expect(state.code).toBe('SKU-001');
    expect(state.name).toBe('Sample product');
  });

  test('save action round-trips the state back through the adapter', async ({ request }) => {
    const body = await callAction(request, ADAPTER_API, {
      route: '/', actionId: 'save',
      componentState: { code: 'SKU-999', name: 'Edited', quantity: 42 },
      serverSideType: ADAPTER_TYPE,
    });
    const messages = body.messages ?? [];
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Saved: SKU-999 / Edited / 42');
  });

});
