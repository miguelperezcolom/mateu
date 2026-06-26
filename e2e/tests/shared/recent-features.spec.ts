import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared helpers (same shape as features.spec.ts / api.spec.ts)
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

function allButtons(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => allNodes(f.component)).flatMap((c: any) => c?.metadata?.buttons ?? []);
}

function allTabs(fragments: any[]): any[] {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .filter((n: any) => n?.metadata?.type === 'Tab')
    .map((n: any) => n.metadata);
}

function titleCommand(body: any): any {
  return body.commands.find((c: any) => c.type === 'SetWindowTitle');
}

// ---------------------------------------------------------------------------
// UploadableImageForm — /uploadable-image  (@UploadableImage)
// ---------------------------------------------------------------------------

const UPLOADABLE_IMAGE_API = '/uploadable-image/mateu/v3/components/_/action';

test.describe('UploadableImageForm — @UploadableImage', () => {

  test('load returns title "Uploadable Image Form" with no errors', async ({ request }) => {
    const body = await callAction(request, UPLOADABLE_IMAGE_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Uploadable Image Form');
    expect(body.messages).toHaveLength(0);
  });

  test('@UploadableImage field "avatar" has stereotype "uploadableImage"', async ({ request }) => {
    const body = await callAction(request, UPLOADABLE_IMAGE_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'avatar')?.stereotype).toBe('uploadableImage');
  });

  test('plain "name" field is a regular string field', async ({ request }) => {
    const body = await callAction(request, UPLOADABLE_IMAGE_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const name = fields.find((f: any) => f.fieldId === 'name');
    expect(name?.stereotype).toBe('regular');
    expect(name?.dataType).toBe('string');
  });

  test('a data-URI value round-trips through save', async ({ request }) => {
    // 1x1 transparent png as data URI — the field carries the image itself.
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAY3Y2wAAAAAElFTkSuQmCC';
    const body = await callAction(request, UPLOADABLE_IMAGE_API, {
      route: '/', actionId: 'save',
      componentState: { name: 'Alice', avatar: dataUri },
      serverSideType: 'io.mateu.sample1.UploadableImageForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe('Saved!');
  });

});

// ---------------------------------------------------------------------------
// TabShortcutForm — /tab-shortcuts  (@Tab(shortcut="alt+1"))
// ---------------------------------------------------------------------------

const TAB_SHORTCUT_API = '/tab-shortcuts/mateu/v3/components/_/action';

test.describe('TabShortcutForm — @Tab(shortcut=...)', () => {

  test('load returns title "Tab Shortcut Form" with no errors', async ({ request }) => {
    const body = await callAction(request, TAB_SHORTCUT_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Tab Shortcut Form');
    expect(body.messages).toHaveLength(0);
  });

  test('three tabs are present with the expected labels', async ({ request }) => {
    const body = await callAction(request, TAB_SHORTCUT_API, { route: '/', actionId: '__load__' });
    const labels = allTabs(body.fragments).map((t: any) => t.label);
    expect(labels).toContain('General');
    expect(labels).toContain('Contact');
    expect(labels).toContain('Notes');
    expect(labels).toHaveLength(3);
  });

  test('each tab carries its keyboard shortcut on the wire', async ({ request }) => {
    const body = await callAction(request, TAB_SHORTCUT_API, { route: '/', actionId: '__load__' });
    const tabs = allTabs(body.fragments);
    const shortcutOf = (label: string) => tabs.find((t: any) => t.label === label)?.shortcut;
    expect(shortcutOf('General')).toBe('alt+1');
    expect(shortcutOf('Contact')).toBe('alt+2');
    expect(shortcutOf('Notes')).toBe('alt+3');
  });

  test('all three tabs render in a single tab strip', async ({ request }) => {
    // No per-tab @Section -> one tabsheet -> exactly one set of 3 Tab nodes.
    const body = await callAction(request, TAB_SHORTCUT_API, { route: '/', actionId: '__load__' });
    expect(allTabs(body.fragments)).toHaveLength(3);
  });

});

// ---------------------------------------------------------------------------
// SemanticAnnotationForm — /semantic-annotations  (composed annotations)
// ---------------------------------------------------------------------------

const SEMANTIC_API = '/semantic-annotations/mateu/v3/components/_/action';

test.describe('SemanticAnnotationForm — semantic (composed) annotations', () => {

  test('load returns title "Semantic Annotation Form" with no errors', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, { route: '/', actionId: '__load__' });
    expect(titleCommand(body)?.data).toBe('Semantic Annotation Form');
    expect(body.messages).toHaveLength(0);
  });

  test('@ProductName resolves the composed @Label', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'productName')?.label).toBe('Product Name');
  });

  test('@ProductName resolves the composed @Help', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'productName')?.description)
      .toBe('The public product display name');
  });

  test('@Secret resolves the composed @Stereotype(password)', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    expect(fields.find((f: any) => f.fieldId === 'apiKey')?.stereotype).toBe('password');
  });

  test('a plain field gets no composed metadata', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, { route: '/', actionId: '__load__' });
    const fields = allFields(body.fragments);
    const plain = fields.find((f: any) => f.fieldId === 'plain');
    // Humanized label, regular stereotype — proves the composition is opt-in.
    expect(plain?.label).toBe('Plain');
    expect(plain?.stereotype).toBe('regular');
  });

  test('save returns a success message', async ({ request }) => {
    const body = await callAction(request, SEMANTIC_API, {
      route: '/', actionId: 'save',
      componentState: { productName: 'Widget', apiKey: 'sk-123', plain: 'x' },
      serverSideType: 'io.mateu.sample1.SemanticAnnotationForm',
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].text).toBe('Saved!');
  });

});
