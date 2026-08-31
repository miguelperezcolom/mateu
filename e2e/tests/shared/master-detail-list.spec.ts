import { test, expect } from '@playwright/test';

/**
 * @MasterDetail on a List FIELD — the per-row "Edit" button must OPEN the row's detail editor,
 * not merely select the row.
 *
 * Regression guard for two bugs that together made "Edit" appear to do nothing:
 *  1. The grid's row-click selection fired on the Edit-button click too, dispatching
 *     `<field>_selected` alongside `<field>_select`; the _selected response rebuilt state with the
 *     pre-click `_show_detail=false`, closing the editor _select had just opened.
 *  2. The detail form rendered into a `vaadin-master-detail-layout` detail slot, which the current
 *     Vaadin version places as an off-screen overlay — the editor was in the DOM but never visible.
 *
 * The UI test is the real net (both bugs are frontend). The API test pins the backend contract the
 * fix relies on.
 */

const API = '/master-detail-list/mateu/v3/components/_/action';
const TYPE = 'io.mateu.sample1.MasterDetailListForm';

async function callAction(request: any, body: object) {
  const response = await request.post(API, {
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

function findField(fragments: any[], fieldId: string): any {
  return fragments
    .flatMap((f: any) => allNodes(f.component))
    .find((c: any) => c?.metadata?.type === 'FormField' && c.metadata.fieldId === fieldId)?.metadata;
}

function load(request: any) {
  return callAction(request, { route: '/', actionId: '', serverSideType: TYPE, consumedRoute: '' });
}

// ---------------------------------------------------------------------------
// Backend contract (API)
// ---------------------------------------------------------------------------

test.describe('@MasterDetail list — backend contract', () => {

  test('the grid wires both a per-row Edit column and row selection', async ({ request }) => {
    const body = await load(request);
    const guests = findField(body.fragments, 'guests');
    expect(guests, 'guests grid field present').toBeTruthy();
    expect(guests.stereotype).toBe('grid');
    // Row selection is wired (guests_selected). The Edit-button click must NOT also trigger it —
    // that double dispatch (guests_select + guests_selected) is exactly what closed the editor.
    expect(guests.onItemSelectionActionId).toBe('guests_selected');
    // A per-row Edit button column (id "_select") is present.
    const editCol = (guests.columns ?? []).find((c: any) => c.id === '_select');
    expect(editCol, 'a _select (Edit) column is present').toBeTruthy();
  });

  test('clicking Edit (_select) returns the row detail form and opens the detail', async ({ request }) => {
    const body = await callAction(request, {
      route: '/', actionId: 'guests_select', serverSideType: TYPE, consumedRoute: '',
      initiatorComponentId: 'guests',
      parameters: { name: 'Ada Lovelace', email: 'ada@example.com', _rowNumber: 0 },
      componentState: {
        guests: [
          { name: 'Ada Lovelace', email: 'ada@example.com', _rowNumber: 0 },
          { name: 'Alan Turing', email: 'alan@example.com', _rowNumber: 1 },
        ],
      },
    });
    // A state fragment flips _show_detail for the field on.
    const stateShowsDetail = (body.fragments ?? []).some(
      (f: any) => f?.state?._show_detail?.guests === true,
    );
    expect(stateShowsDetail, '_show_detail.guests === true').toBeTruthy();
    // A detail Form for the row is returned (targeting the field's container).
    const hasDetailForm = (body.fragments ?? []).some((f: any) =>
      allNodes(f.component).some((n: any) => n?.metadata?.type === 'Form'),
    );
    expect(hasDetailForm, 'a detail Form is returned').toBeTruthy();
  });

});

// ---------------------------------------------------------------------------
// The actual regression: clicking Edit opens a VISIBLE editor (UI)
// ---------------------------------------------------------------------------

test.describe('@MasterDetail list — Edit opens the detail editor (UI)', () => {

  test('clicking a row Edit button shows the detail editor with the row fields', async ({ page }) => {
    await page.goto('/master-detail-list');
    await page.waitForSelector('vaadin-grid', { timeout: 20000 });

    // The editor is not shown before clicking Edit.
    await expect(page.getByText('Update Guest')).toHaveCount(0);

    // Click the first row's Edit button (must open the editor, NOT just select the row).
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

    // The detail editor opens and is visible with the row's data.
    await expect(page.getByText('Update Guest')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada Lovelace');
  });

});
