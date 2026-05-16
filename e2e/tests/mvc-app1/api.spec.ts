import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT_API = '/mateu/v3/components/_/action';
const APP_API  = '/app/mateu/v3/components/_/action';

async function callAction(request: any, url: string, body: object) {
  const response = await request.post(url, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

function collectButtons(component: any): any[] {
  const direct = component?.metadata?.buttons ?? [];
  const nested = (component?.children ?? []).flatMap(collectButtons);
  return [...direct, ...nested];
}

function collectToolbar(component: any): any[] {
  const direct = component?.metadata?.toolbar ?? [];
  const nested = (component?.children ?? []).flatMap(collectToolbar);
  return [...direct, ...nested];
}

function collectFields(component: any): any[] {
  const isField = component?.metadata?.fieldId !== undefined;
  const direct = isField ? [component.metadata] : [];
  const nested = (component?.children ?? []).flatMap(collectFields);
  return [...direct, ...nested];
}

function allButtons(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => collectButtons(f.component));
}

function allToolbar(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => collectToolbar(f.component));
}

function allFields(fragments: any[]): any[] {
  return fragments.flatMap((f: any) => collectFields(f.component));
}

function titleCommand(body: any): any {
  return body.commands.find((c: any) => c.type === 'SetWindowTitle');
}

// ---------------------------------------------------------------------------
// SimpleForm — root UI ("/")
// ---------------------------------------------------------------------------

test.describe('SimpleForm API', () => {

  test('load returns title "Simple Form" and a fragment', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });

    expect(body.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'SetWindowTitle', data: 'Simple Form' }),
      ]),
    );
    expect(body.fragments.length).toBeGreaterThan(0);
    expect(body.messages).toHaveLength(0);
  });

  test('load exposes a "greet" button in the fragment metadata', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });

    const allButtons = body.fragments
      .flatMap((f: any) => f.component?.children ?? [])
      .flatMap((c: any) => c.metadata?.buttons ?? []);

    expect(allButtons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionId: 'greet' }),
      ]),
    );
  });

  test('greet with a name returns a success message', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: 'greet',
      componentState: { name: 'World' },
    });

    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].variant).toBe('success');
    expect(body.messages[0].text).toContain('Hello World!');
  });

  test('greet message text includes the provided name', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: 'greet',
      componentState: { name: 'Mateu' },
    });

    expect(body.messages[0].text).toContain('Mateu');
  });

});

// ---------------------------------------------------------------------------
// SimpleForm — edge cases
// ---------------------------------------------------------------------------

test.describe('SimpleForm API — edge cases', () => {

  test('load returns no messages', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });
    expect(body.messages).toHaveLength(0);
  });

  test('greet message text starts with "Hello" and ends with "!"', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: 'greet',
      componentState: { name: 'Test' },
    });
    expect(body.messages[0].text).toMatch(/^Hello .+!$/);
  });

  test('greet with different names each return the correct name', async ({ request }) => {
    for (const name of ['Alice', 'Bob', 'Mateu']) {
      const body = await callAction(request, ROOT_API, {
        route: '/',
        actionId: 'greet',
        componentState: { name },
      });
      expect(body.messages[0].text).toContain(name);
    }
  });

});

// ---------------------------------------------------------------------------
// MenuApp — /app UI
// ---------------------------------------------------------------------------

test.describe('MenuApp API', () => {

  test('load returns title "Menu App"', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });

    expect(body.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'SetWindowTitle', data: 'Menu App' }),
      ]),
    );
    expect(body.messages).toHaveLength(0);
  });

  test('load returns an App fragment with a menu', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });

    const appFragment = body.fragments.find(
      (f: any) => f.component?.metadata?.type === 'App',
    );
    expect(appFragment).toBeDefined();

    const menu: any[] = appFragment.component.metadata.menu;
    expect(menu.length).toBeGreaterThanOrEqual(2);
  });

  test('menu contains Section 1 and Section 2 entries', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });

    const menu: any[] = body.fragments
      .find((f: any) => f.component?.metadata?.type === 'App')
      .component.metadata.menu;

    const labels = menu.map((item: any) => item.label);
    expect(labels).toContain('Section 1');
    expect(labels).toContain('Section 2');
  });

  test('menu entries have the correct paths', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });

    const menu: any[] = body.fragments
      .find((f: any) => f.component?.metadata?.type === 'App')
      .component.metadata.menu;

    const section1 = menu.find((item: any) => item.label === 'Section 1');
    const section2 = menu.find((item: any) => item.label === 'Section 2');

    expect(section1?.path).toBe('/section1');
    expect(section2?.path).toBe('/section2');
  });

});

// ---------------------------------------------------------------------------
// Section1 — sub-page of MenuApp (/app/section1)
// ---------------------------------------------------------------------------

const SECTION1_TYPE = 'io.mateu.sample1.Section1';

test.describe('Section1 API', () => {

  test('load via route returns fragments with no errors', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section1',
      actionId: '__load__',
    });
    expect(body.fragments.length).toBeGreaterThan(0);
    expect(body.messages).toHaveLength(0);
  });

  test('submit with a value returns a success message', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section1',
      actionId: 'submit',
      componentState: { value: 'HelloSection1' },
      serverSideType: SECTION1_TYPE,
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].variant).toBe('success');
    expect(body.messages[0].text).toContain('HelloSection1');
  });

  test('submit message starts with "Submitted:"', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section1',
      actionId: 'submit',
      componentState: { value: 'AnyValue' },
      serverSideType: SECTION1_TYPE,
    });
    expect(body.messages[0].text).toMatch(/^Submitted:/);
  });

  test('submit with different values each return the correct value', async ({ request }) => {
    for (const value of ['Alpha', 'Beta', 'Gamma']) {
      const body = await callAction(request, APP_API, {
        route: '/section1',
        actionId: 'submit',
        componentState: { value },
        serverSideType: SECTION1_TYPE,
      });
      expect(body.messages[0].text).toContain(value);
    }
  });

});

// ---------------------------------------------------------------------------
// Section2 — sub-page of MenuApp (/app/section2)
// ---------------------------------------------------------------------------

test.describe('Section2 API', () => {

  test('load via route returns fragments with no errors', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section2',
      actionId: '__load__',
    });
    expect(body.fragments.length).toBeGreaterThan(0);
    expect(body.messages).toHaveLength(0);
  });

});

// ---------------------------------------------------------------------------
// Button metadata — labels and actionIds
// ---------------------------------------------------------------------------

test.describe('Button metadata', () => {

  test('SimpleForm: greet button has actionId "greet" and label "Greet"', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });
    const buttons = allButtons(body.fragments);
    const greet = buttons.find((b: any) => b.actionId === 'greet');
    expect(greet).toBeDefined();
    expect(greet.label).toBe('Greet');
  });

  test('Section1: submit button has actionId "submit" and label "Submit"', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section1',
      actionId: '__load__',
    });
    const buttons = allButtons(body.fragments);
    const submit = buttons.find((b: any) => b.actionId === 'submit');
    expect(submit).toBeDefined();
    expect(submit.label).toBe('Submit');
  });

  test('Section2: no action buttons (no @Button methods)', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section2',
      actionId: '__load__',
    });
    const buttons = allButtons(body.fragments);
    expect(buttons).toHaveLength(0);
  });

});

// ---------------------------------------------------------------------------
// Commands structure
// ---------------------------------------------------------------------------

test.describe('Commands structure', () => {

  test('SimpleForm load emits a SetWindowTitle command with data "Simple Form"', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });
    const cmd = titleCommand(body);
    expect(cmd).toBeDefined();
    expect(cmd.type).toBe('SetWindowTitle');
    expect(cmd.data).toBe('Simple Form');
  });

  test('MenuApp load emits a SetWindowTitle command with data "Menu App"', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });
    const cmd = titleCommand(body);
    expect(cmd).toBeDefined();
    expect(cmd.data).toBe('Menu App');
  });

  test('greet action emits no SetWindowTitle command', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: 'greet',
      componentState: { name: 'Test' },
    });
    expect(titleCommand(body)).toBeUndefined();
  });

});

// ---------------------------------------------------------------------------
// Idempotency — repeated loads return consistent results
// ---------------------------------------------------------------------------

test.describe('Idempotency', () => {

  test('two consecutive SimpleForm loads return the same title', async ({ request }) => {
    const load = () => callAction(request, ROOT_API, { route: '/', actionId: '__load__' });
    const [b1, b2] = await Promise.all([load(), load()]);
    expect(titleCommand(b1)?.data).toBe(titleCommand(b2)?.data);
  });

  test('two consecutive MenuApp loads return the same menu length', async ({ request }) => {
    const load = () => callAction(request, APP_API, { route: '/', actionId: '__load__' });
    const [b1, b2] = await Promise.all([load(), load()]);
    const menuLen = (b: any) =>
      b.fragments.find((f: any) => f.component?.metadata?.type === 'App')?.component.metadata.menu
        ?.length ?? 0;
    expect(menuLen(b1)).toBe(menuLen(b2));
  });

});

// ---------------------------------------------------------------------------
// MenuApp menu — count and structure
// ---------------------------------------------------------------------------

test.describe('MenuApp menu — extended', () => {

  test('menu has exactly 2 entries', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });
    const menu = body.fragments
      .find((f: any) => f.component?.metadata?.type === 'App')
      .component.metadata.menu;
    expect(menu).toHaveLength(2);
  });

  test('all menu entries have a non-empty label and path', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });
    const menu: any[] = body.fragments
      .find((f: any) => f.component?.metadata?.type === 'App')
      .component.metadata.menu;
    for (const item of menu) {
      expect(item.label).toBeTruthy();
      expect(item.path).toBeTruthy();
    }
  });

  test('all menu paths start with "/"', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/',
      actionId: '__load__',
    });
    const menu: any[] = body.fragments
      .find((f: any) => f.component?.metadata?.type === 'App')
      .component.metadata.menu;
    for (const item of menu) {
      expect(item.path).toMatch(/^\//);
    }
  });

});

// ---------------------------------------------------------------------------
// AllTypesForm — /all-types UI
// ---------------------------------------------------------------------------

const ALL_TYPES_API = '/all-types/mateu/v3/components/_/action';
const ALL_TYPES_TYPE = 'io.mateu.sample1.AllTypesForm';

test.describe('AllTypesForm API', () => {

  test('load returns title "All Types Form"', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: '__load__',
    });
    expect(titleCommand(body)?.data).toBe('All Types Form');
    expect(body.fragments.length).toBeGreaterThan(0);
    expect(body.messages).toHaveLength(0);
  });

  test('save button exists in buttons (not toolbar)', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: '__load__',
    });
    const buttons = allButtons(body.fragments);
    const toolbar = allToolbar(body.fragments);
    expect(buttons.find((b: any) => b.actionId === 'save')).toBeDefined();
    expect(toolbar.find((b: any) => b.actionId === 'save')).toBeUndefined();
  });

  test('refresh button exists in toolbar (not buttons)', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: '__load__',
    });
    const buttons = allButtons(body.fragments);
    const toolbar = allToolbar(body.fragments);
    expect(toolbar.find((b: any) => b.actionId === 'refresh')).toBeDefined();
    expect(buttons.find((b: any) => b.actionId === 'refresh')).toBeUndefined();
  });

  test('save returns a success message containing the text value', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: 'save',
      componentState: { text: 'hello' },
      serverSideType: ALL_TYPES_TYPE,
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].variant).toBe('success');
    expect(body.messages[0].text).toContain('hello');
  });

  test('refresh returns a success message "Refreshed!"', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: 'refresh',
      serverSideType: ALL_TYPES_TYPE,
    });
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].variant).toBe('success');
    expect(body.messages[0].text).toBe('Refreshed!');
  });

});

// ---------------------------------------------------------------------------
// Field metadata — dataType, required, label
// ---------------------------------------------------------------------------

test.describe('Field metadata', () => {

  test('SimpleForm: "name" field is string, required, label "Name"', async ({ request }) => {
    const body = await callAction(request, ROOT_API, {
      route: '/',
      actionId: '__load__',
    });
    const fields = allFields(body.fragments);
    const f = fields.find((f: any) => f.fieldId === 'name');
    expect(f).toBeDefined();
    expect(f.dataType).toBe('string');
    expect(f.required).toBe(true);
    expect(f.label).toBe('Name');
  });

  test('Section1: "value" field is string and required', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section1',
      actionId: '__load__',
    });
    const fields = allFields(body.fragments);
    const f = fields.find((f: any) => f.fieldId === 'value');
    expect(f).toBeDefined();
    expect(f.dataType).toBe('string');
    expect(f.required).toBe(true);
  });

  test('Section2: "description" is string, "count" is integer, neither required', async ({ request }) => {
    const body = await callAction(request, APP_API, {
      route: '/section2',
      actionId: '__load__',
    });
    const fields = allFields(body.fragments);
    const desc = fields.find((f: any) => f.fieldId === 'description');
    const cnt  = fields.find((f: any) => f.fieldId === 'count');
    expect(desc?.dataType).toBe('string');
    expect(desc?.required).toBe(false);
    expect(cnt?.dataType).toBe('integer');
    expect(cnt?.required).toBe(false);
  });

  test('AllTypesForm: text=string(required), count=integer, active=bool, date=date', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: '__load__',
    });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('text')?.dataType).toBe('string');
    expect(byId('text')?.required).toBe(true);

    expect(byId('count')?.dataType).toBe('integer');
    expect(byId('count')?.required).toBe(false);

    expect(byId('active')?.dataType).toBe('bool');
    expect(byId('active')?.required).toBe(false);

    expect(byId('date')?.dataType).toBe('date');
    expect(byId('date')?.required).toBe(false);
  });

  test('AllTypesForm: field labels are humanized from field names', async ({ request }) => {
    const body = await callAction(request, ALL_TYPES_API, {
      route: '/',
      actionId: '__load__',
    });
    const fields = allFields(body.fragments);
    const byId = (id: string) => fields.find((f: any) => f.fieldId === id);

    expect(byId('text')?.label).toBe('Text');
    expect(byId('count')?.label).toBe('Count');
    expect(byId('active')?.label).toBe('Active');
    expect(byId('date')?.label).toBe('Date');
  });

});
