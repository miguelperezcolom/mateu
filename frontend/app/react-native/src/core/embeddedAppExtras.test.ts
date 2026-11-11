import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contextChipText, embeddedAppExtrasOf, headerActionLeaves, splitHeaderActions } from './embeddedAppExtras.ts';

const hotel = { fieldName: 'hotel', label: 'Hotel', options: [{ value: 'PMI', label: 'Palma' }, { value: 2, label: 'Ibiza' }] };

test('an embedded App brings its context selectors, header actions and bell', () => {
  const extras = embeddedAppExtrasOf({
    type: 'App',
    title: 'Front office',
    serverSideType: 'com.example.Home',
    rootRoute: '/fo',
    contextSelectors: [hotel, { label: 'no field' }],
    contextActions: [{ actionId: 'checkIn', label: 'Check in' }, { label: 'empty' }],
    notificationsEnabled: true,
  });
  assert.ok(extras);
  assert.equal(extras.title, 'Front office');
  assert.equal(extras.serverSideType, 'com.example.Home');
  assert.equal(extras.rootRoute, '/fo');
  assert.deepEqual(extras.contextSelectors.map((s) => s.fieldName), ['hotel']);
  assert.deepEqual(extras.contextActions.map((a) => a.actionId), ['checkIn']);
  assert.equal(extras.notificationsEnabled, true);
});

test('an App with no extras (a crud mediator, a plain app) draws no bar', () => {
  assert.equal(embeddedAppExtrasOf({ type: 'App', title: 'x', menu: [] }), null);
  assert.equal(embeddedAppExtrasOf({ type: 'Form' }), null);
  assert.equal(embeddedAppExtrasOf(null), null);
  // a data-authored inbox counts
  assert.ok(embeddedAppExtrasOf({ type: 'App', notificationsEnabled: true, notificationsSource: { ref: 'inbox' } })?.notificationsSource);
});

test('a context chip names the selector and the chosen option', () => {
  assert.equal(contextChipText(hotel, { hotel: 'PMI' }), 'Hotel: Palma');
  assert.equal(contextChipText(hotel, { hotel: '2' }), 'Hotel: Ibiza');
  assert.equal(contextChipText(hotel, { hotel: 'XYZ' }), 'Hotel: XYZ');
  assert.equal(contextChipText(hotel, {}), 'Hotel: not set');
  assert.equal(contextChipText({ fieldName: 'year' }, { year: 2026 }), 'year: 2026');
});

test('header actions: two plain ones inline, the rest and every menu in the sheet', () => {
  const menu = { label: 'Reports', children: [{ actionId: 'daily', label: 'Daily' }, { label: 'More', children: [{ actionId: 'yearly', label: 'Yearly' }] }] };
  const split = splitHeaderActions([{ actionId: 'a', label: 'A' }, menu, { actionId: 'b', label: 'B' }, { actionId: 'c', label: 'C' }]);
  assert.deepEqual(split.inline.map((a) => a.actionId), ['a', 'b']);
  assert.deepEqual(split.more.map((a) => a.actionId ?? a.label), ['c', 'Reports']);
  assert.deepEqual(headerActionLeaves(menu).map((a) => a.actionId), ['daily', 'yearly']);
  assert.deepEqual(headerActionLeaves({ actionId: 'x' }).map((a) => a.actionId), ['x']);
  assert.deepEqual(headerActionLeaves({ label: 'nothing' }), []);
});
