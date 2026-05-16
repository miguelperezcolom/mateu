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
