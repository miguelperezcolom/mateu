import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// InlineGridForm — /inline-grid-form  (sample1)
//
// A PLAIN form (no wizard, no CRUD orchestrator) hosting grid fields and a
// lookup — the combination that historically only worked inside wizards.
// Regression suite for:
//  - inline-editing grid: "+" appends an in-place row (no detail dialog)
//  - detail-form grid: add/create resolve the row type from the field's
//    generic type (no _rowClass in the state outside wizards)
//  - @Lookup without label= falls back to the raw id instead of NPE
//  - the form action reads the inline-edited rows back (state round-trip)
// ---------------------------------------------------------------------------

const API = '/inline-grid-form/mateu/v3/components/_/action';
const TYPE = 'io.mateu.sample1.InlineGridForm';

async function callAction(request: any, url: string, body: object) {
  const response = await request.post(url, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  return Array.isArray(json) ? json[0] : json;
}

function load(request: any) {
  return callAction(request, API, { route: '/', actionId: '', serverSideType: TYPE, consumedRoute: '' });
}

function act(request: any, actionId: string, componentState: any, parameters?: any) {
  return callAction(request, API, {
    route: '/', actionId, serverSideType: TYPE, consumedRoute: '', componentState, parameters,
  });
}

function stateOf(body: any): any {
  return body.fragments?.find((f: any) => f.state)?.state ?? {};
}

function errorMessages(body: any): any[] {
  return (body.messages ?? []).filter(
    (m: any) => m.variant === 'error' || String(m.title ?? '').includes('Exception'));
}

const EMPTY_STATE = { name: '', supplierId: 'S1', lines: [], extras: [], snapshot: [] };

test.describe('InlineGridForm — grids and lookup on a plain form', () => {

  test('loads with no errors and the lookup label falls back to the raw id', async ({ request }) => {
    const body = await load(request);
    expect(errorMessages(body)).toHaveLength(0);
    // No label supplier declared: the data must still carry a label — the raw id.
    expect(JSON.stringify(body)).toContain('"supplierId-label":"S1"');
  });

  test('inline grid: "+" appends an empty in-place row', async ({ request }) => {
    const body = await act(request, 'lines_add', EMPTY_STATE);
    expect(errorMessages(body)).toHaveLength(0);
    const lines = stateOf(body).lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].concept).toBe('');
  });

  test('inline grid: "+" preserves the rows already edited', async ({ request }) => {
    const body = await act(request, 'lines_add', {
      ...EMPTY_STATE, lines: [{ concept: 'Towels', qty: 2 }],
    });
    const lines = stateOf(body).lines;
    expect(lines).toHaveLength(2);
    expect(lines[0].concept).toBe('Towels');
  });

  test('detail-form grid: add opens the detail form without _rowClass in the state', async ({ request }) => {
    const body = await act(request, 'extras_add', EMPTY_STATE);
    expect(errorMessages(body)).toHaveLength(0);
    // one fragment carries the state flip, another the detail form for the container
    expect(stateOf(body)._show_detail?.extras).toBe(true);
    expect(body.fragments.some((f: any) => f.targetComponentId === 'extras-container')).toBeTruthy();
  });

  test('detail-form grid: create appends the new row resolved from the generic type', async ({ request }) => {
    const body = await act(request, 'extras_create', EMPTY_STATE,
        { initiatorState: { concept: 'Parking', qty: 1 } });
    expect(errorMessages(body)).toHaveLength(0);
    const extras = stateOf(body).extras;
    expect(extras).toHaveLength(1);
    expect(extras[0].concept).toBe('Parking');
  });

  test('the form action reads the inline-edited rows back', async ({ request }) => {
    const body = await act(request, 'recalc', {
      ...EMPTY_STATE, lines: [{ concept: 'Towels', qty: 2 }, { concept: 'Cot', qty: 1 }],
    });
    expect(errorMessages(body)).toHaveLength(0);
    expect((body.messages ?? []).some((m: any) => String(m.text).includes('2 lines'))).toBeTruthy();
    expect(stateOf(body).snapshot).toHaveLength(2);
  });
});
