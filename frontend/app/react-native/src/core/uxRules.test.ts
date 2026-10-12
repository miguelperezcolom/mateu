import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bootFailureOf, buttonActionId, fabBottom, chartTextAlternative, effectiveListingLayout, fabInset, formatTick, headingLevel, rowJustification, fieldPlaceholder, isCurrentDestination, loadFailureMessage,
  rowCheckboxLabel, serverSideState, mediatorMove, progressFraction, moneyInputText, moneyInputCommit, moneyText, stepperValue, decimalDraft, isFormRoute,
} from './uxRules.ts';

test('a crud mediator move: the listing stays, a record goes back to its list, a record route stacks', () => {
  // the Java SUT's /bulk-actions: seeded with "" and its delete answers "/list" — same screen
  assert.equal(mediatorMove('/list', '', true), 'stay');
  assert.equal(mediatorMove('/list', 'list', true), 'stay');
  // a pushed record screen (its load seeded nothing): Back to list / Cancel return to the listing
  assert.equal(mediatorMove('/list', null, true), 'backToList');
  assert.equal(mediatorMove('', null, true), 'backToList');
  // the listing opening a record, and a record screen opening its edit form, stack
  assert.equal(mediatorMove('/1', 'list', true), 'detail');
  assert.equal(mediatorMove('/1/edit', null, true), 'detail');
  // the same record route again stays
  assert.equal(mediatorMove('/1', '1', true), 'stay');
  // no stack to push onto (an embedded island): everything happens in place
  assert.equal(mediatorMove('/1', 'list', false), 'inPlace');
  assert.equal(mediatorMove('/list', null, false), 'inPlace');
});

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

test('a boot load with nothing to render says why instead of drawing a blank screen', () => {
  assert.equal(bootFailureOf({ fragments: [{ component: { type: 'ClientSide' } }], messages: [] }), null);
  assert.equal(
    bootFailureOf({ fragments: [], messages: [{ variant: 'error', title: 'Something went wrong', text: 'Reference: 42' }] }),
    'Something went wrong: Reference: 42',
  );
  assert.equal(bootFailureOf({ fragments: [] }), 'The server answered with nothing to show.');
});

test('a page FAB sits above the page bottom bar, never under it', () => {
  assert.equal(fabBottom(false), 24);
  assert.ok(fabBottom(true) >= 76 + 24);
});

test('a progress bar reads its state key, and a 0 max means the 0..1 default (the LongTask dialog)', () => {
  assert.equal(progressFraction({ min: 0, max: 0, value: 0, valueKey: 'progressValue' }, { progressValue: 1 }), 1);
  assert.equal(progressFraction({ min: 0, max: 0, value: 0, valueKey: 'progressValue' }, { progressValue: 0.4 }), 0.4);
  assert.equal(progressFraction({ min: 0, max: 5, value: 2 }, {}), 0.4);
  assert.equal(progressFraction({ value: 3 }, {}), 1);
});

test('an Amount field edits its value and keeps currency/locale (nullable-numbers spec)', () => {
  const price = { currency: 'EUR', value: 25.5, locale: 'de-DE' };
  assert.equal(moneyInputText(price), '25.5');
  assert.deepEqual(moneyInputCommit(price, ''), { currency: 'EUR', value: 0, locale: 'de-DE' });
  assert.deepEqual(moneyInputCommit(price, '12,5'), { currency: 'EUR', value: 12.5, locale: 'de-DE' });
  assert.equal(moneyInputText(7), '7');
  assert.equal(moneyInputCommit(7, ''), null);
  assert.equal(moneyInputText(null), '');
  assert.equal(moneyText(price).replace(/\s/g, ' '), '25,50 €');
  assert.equal(moneyText(1234.5), '1.234,50');
});

test('an unset integer stepper is empty, not 0', () => {
  assert.equal(stepperValue(null), null);
  assert.equal(stepperValue(undefined), null);
  assert.equal(stepperValue(''), null);
  assert.equal(stepperValue(0), 0);
  assert.equal(stepperValue('3'), 3);
});

test('a decimal input keeps the text being typed (12. → 12.5, not 125)', () => {
  assert.equal(decimalDraft('12.', '12'), '12.');
  assert.equal(decimalDraft('12,', '12'), '12,');
  assert.equal(decimalDraft('', '0'), '');      // a cleared Amount commits 0: the field stays empty
  assert.equal(decimalDraft('', ''), '');
  assert.equal(decimalDraft('12.5', '12.5'), '12.5');
  assert.equal(decimalDraft('12.5', '30'), '30'); // changed from elsewhere (a reload, an action)
});

test('a saved create/edit form is replaced by its record, not stacked under it', () => {
  assert.ok(isFormRoute('/items/new'));
  assert.ok(isFormRoute('/items/1/edit'));
  assert.ok(isFormRoute('/items/1/edit/'));
  assert.ok(!isFormRoute('/items/1'));
  assert.ok(!isFormRoute('/items'));
  assert.ok(!isFormRoute('/news'));
  assert.ok(!isFormRoute(null));
});
