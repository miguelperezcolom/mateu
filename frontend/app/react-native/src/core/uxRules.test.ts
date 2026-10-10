import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buttonActionId, chartTextAlternative, effectiveListingLayout, fabInset, formatTick, headingLevel, rowJustification, fieldPlaceholder, isCurrentDestination, loadFailureMessage,
  rowCheckboxLabel, serverSideState,
} from './uxRules.ts';

test('RN-01 a toolbar button dispatches its actionId (the crud New/Delete buttons carry no id)', () => {
  // the exact shape the Products crud toolbar sends
  assert.equal(buttonActionId({ actionId: 'new', id: undefined }), 'new');
  assert.equal(buttonActionId({ actionId: 'action-on-row-doSomethingOnRows' }), 'action-on-row-doSomethingOnRows');
  assert.equal(buttonActionId({ id: 'legacy' }), 'legacy');
  assert.equal(buttonActionId({ actionId: null, id: null }), '');
  assert.equal(buttonActionId(undefined), '');
});

test('RN-02 a ServerSide component renders against initialData overlaid with the fragment state', () => {
  const component = { type: 'ServerSide', initialData: { mode: 'view', nombre: 'stale' } };
  assert.deepEqual(serverSideState(component, { nombre: 'Ada Lovelace', email: 'ada@example.com' }), {
    mode: 'view', nombre: 'Ada Lovelace', email: 'ada@example.com',
  });
  assert.deepEqual(serverSideState(component, null), { mode: 'view', nombre: 'stale' });
  assert.deepEqual(serverSideState({}, { a: 1 }), { a: 1 });
  assert.deepEqual(serverSideState(null, [1, 2]), {});
});

test('RN-14 an undeclared listing is a list on a phone and a table elsewhere; a declared layout always wins', () => {
  assert.equal(effectiveListingLayout('auto', 390), 'list');
  assert.equal(effectiveListingLayout(undefined, 390), 'list');
  assert.equal(effectiveListingLayout('auto', 820), 'table');
  assert.equal(effectiveListingLayout('table', 390), 'table');
  assert.equal(effectiveListingLayout('cards', 1200), 'cards');
  assert.equal(effectiveListingLayout('auto', 0), 'table'); // unknown width: keep the web default
});

test('RN-10 an input only shows a placeholder the developer declared — never its own label', () => {
  assert.equal(fieldPlaceholder({ placeholder: null }), undefined);
  assert.equal(fieldPlaceholder({ placeholder: '  ' }), undefined);
  assert.equal(fieldPlaceholder({ placeholder: 'e.g. ada@example.com' }), 'e.g. ada@example.com');
  assert.equal(fieldPlaceholder(undefined), undefined);
});

test('RN-15 the drawer marks the current destination, tolerant of slashes', () => {
  assert.equal(isCurrentDestination({ route: '/products' }, '/products'), true);
  assert.equal(isCurrentDestination({ route: 'products/' }, '/products'), true);
  assert.equal(isCurrentDestination({ route: '/products' }, '/salesReport'), false);
  assert.equal(isCurrentDestination({ route: '' }, ''), false);
});

test('RN-05 a failed load is explained in plain language with a way forward', () => {
  assert.equal(loadFailureMessage('Failed to fetch').title, "Can't reach the server");
  assert.equal(loadFailureMessage('Network request failed').title, "Can't reach the server");
  assert.match(loadFailureMessage('HTTP 503').title, /server/);
  assert.match(loadFailureMessage('Request failed with status 401').title, /access/);
  assert.equal(loadFailureMessage('').title, "This screen couldn't be loaded");
  assert.equal(loadFailureMessage('Something odd').detail, 'Something odd');
});

test('RN-13 FABs reserve their band at the bottom so they never cover controls', () => {
  assert.equal(fabInset(0), 0);
  assert.ok(fabInset(1) >= 52 + 16);
});

test('RN-11 a chart carries its data as a text alternative', () => {
  assert.equal(
    chartTextAlternative(['Jan', 'Feb'], [{ label: '2026', data: [120, 180] }], false),
    'Chart. 2026. Jan: 120, Feb: 180',
  );
  assert.equal(chartTextAlternative(['Web', 'Stores'], [{ data: [3, 1] }], true), 'Pie chart. Web: 75%, Stores: 25%');
  assert.match(chartTextAlternative([], [{ data: Array.from({ length: 15 }, (_, i) => i) }], false, 12), /and 3 more$/);
  assert.equal(chartTextAlternative([], [], false), 'Chart, no data');
  assert.equal(formatTick(87), '87');
  assert.equal(formatTick(1200), '1.2k');
  assert.equal(formatTick(3_400_000), '3.4M');
});

test('RN-16 a row honours its declared justification; an undeclared one shares the width', () => {
  assert.equal(rowJustification('END'), 'flex-end');
  assert.equal(rowJustification('between'), 'space-between');
  assert.equal(rowJustification(null), null);
  assert.equal(rowJustification(''), null);
});

test('RN-17 a Text in an h1–h6 container is a heading of that level', () => {
  assert.equal(headingLevel('h2'), 2);
  assert.equal(headingLevel('H1'), 1);
  assert.equal(headingLevel('p'), 0);
  assert.equal(headingLevel(undefined), 0);
});

test('RN-04 a row checkbox says which row it selects', () => {
  assert.equal(rowCheckboxLabel('Producto 10'), 'Select Producto 10');
  assert.equal(rowCheckboxLabel(''), 'Select row');
  assert.equal(rowCheckboxLabel(null), 'Select row');
});
