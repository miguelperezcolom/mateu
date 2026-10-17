// What the view controller reads off a component (componentContext.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  actionFlagsOf, actionTargetOf, appHomeOf, errorSummary, fieldErrorsOf, namedEventOf, orchestratorOf,
  ownsAction, seedSearchDefaults, subscriptionParameters, toastOf, triggerPlanOf,
} from './componentContext.ts';

test('action flags by id; id-less entries skipped; a non-array is no actions', () => {
  const f = actionFlagsOf([
    { id: 'save', validationRequired: true, bubble: true },
    { id: 'delete', rowsSelectedRequired: true, confirmationRequired: true },
    { id: 'export', sse: true, restAction: { source: { url: '/x' } } },
    { id: 'bad', restAction: 'nope' },
    { validationRequired: true },
  ]);
  assert.deepEqual(f.ids, ['save', 'delete', 'export', 'bad']);
  assert.deepEqual(f.validationRequired, { save: true, delete: false, export: false, bad: false });
  assert.deepEqual(f.rowsSelectedRequired, { save: false, delete: true, export: false, bad: false });
  assert.deepEqual(Object.keys(f.confirmation), ['delete']);
  assert.deepEqual(f.sse, { export: true });
  assert.deepEqual(f.bubble, { save: true, delete: false, export: false, bad: false });
  assert.deepEqual(f.restData, { export: { source: { url: '/x' } } });
  assert.deepEqual(actionFlagsOf(undefined).ids, []);
});

test('ownership: exact ids and prefix wildcards', () => {
  assert.equal(ownsAction(['save', 'nested-*'], 'save'), true);
  assert.equal(ownsAction(['save', 'nested-*'], 'nested-form-action-x'), true);
  assert.equal(ownsAction(['save'], 'edit'), false);
  assert.equal(ownsAction([], 'edit'), false);
});

test('the action target: the orchestrator under its route, else the navigation type, else own', () => {
  const base = { bubbles: true, currentServerSideType: 'Detail', currentRoute: '/crud/1', orchestratorServerSideType: 'Crud', orchestratorComponentRoute: '/crud', navigationServerSideType: 'Nav' };
  assert.equal(actionTargetOf(base), 'Crud');
  assert.equal(actionTargetOf({ ...base, currentRoute: '/other' }), 'Nav');
  assert.equal(actionTargetOf({ ...base, orchestratorServerSideType: 'Detail' }), 'Nav');
  assert.equal(actionTargetOf({ ...base, orchestratorServerSideType: '', navigationServerSideType: 'Detail' }), 'Detail');
  assert.equal(actionTargetOf({ ...base, bubbles: false }), 'Detail');
});

test('an orchestrator is named by componentRoute or _componentRoute plus a type', () => {
  assert.deepEqual(orchestratorOf({ serverSideType: 'C', initialData: { componentRoute: '/c' } }), { serverSideType: 'C', componentRoute: '/c' });
  assert.deepEqual(orchestratorOf({ serverSideType: 'C', initialData: { _componentRoute: '/d' } }), { serverSideType: 'C', componentRoute: '/d' });
  assert.equal(orchestratorOf({ serverSideType: 'C' }), null);
  assert.equal(orchestratorOf({ initialData: { componentRoute: '/c' } }), null);
});

test('the trigger plan: AutoSave defaults, custom-event subscriptions, the rest ignored', () => {
  const p = triggerPlanOf([
    { type: 'AutoSave' },
    { type: 'OnCustomEvent', eventName: 'saved', actionId: 'load', source: 'component', from: 'list' },
    { type: 'OnCustomEvent', eventName: 'x' },
    { type: 'OnLoad', actionId: 'search' },
  ]);
  assert.deepEqual(p.autoSave, { actionId: 'save', debounceMillis: 800 });
  assert.deepEqual(p.subscriptions, [{ eventName: 'saved', actionId: 'load', from: 'list', scope: 'COMPONENT' }]);
  assert.deepEqual(triggerPlanOf([{ type: 'autosave', actionId: 'draft', debounceMillis: 200 }]).autoSave, { actionId: 'draft', debounceMillis: 200 });
  assert.deepEqual(triggerPlanOf(undefined), { autoSave: null, subscriptions: [] });
});

test('a subscription filters COMPONENT-scoped events by the emitter, passes the rest', () => {
  const sub = { eventName: 'e', actionId: 'a', from: 'list', scope: 'COMPONENT' };
  assert.equal(subscriptionParameters(sub, { __source: 'other' }), null);
  assert.deepEqual(subscriptionParameters(sub, { __source: 'list', id: 1 }), { __source: 'list', id: 1 });
  assert.deepEqual(subscriptionParameters({ ...sub, scope: 'DOCUMENT' }, { __source: 'other' }), { __source: 'other' });
  assert.deepEqual(subscriptionParameters({ ...sub, scope: 'DOCUMENT' }, 'text'), {});
  assert.deepEqual(subscriptionParameters({ ...sub, from: '' }, null), {});
});

test('field errors: first failure per field, the default message, summary text', () => {
  const errors = fieldErrorsOf(
    [{ fieldId: 'name', condition: 'no', message: 'Required' }, { fieldId: 'name', condition: 'no', message: 'Other' },
      { fieldId: 'age', condition: 'no' }, { fieldId: 'ok', condition: 'yes' }, { fieldId: 'nocond' }],
    (c) => c === 'yes',
  );
  assert.deepEqual(errors, { name: 'Required', age: 'Invalid value' });
  assert.equal(errorSummary(errors), 'name: Required; age: Invalid value');
});

test('named events: payload or detail, objects stamped with __source, others untouched', () => {
  assert.equal(namedEventOf(null, 'me'), null);
  assert.equal(namedEventOf({ payload: {} }, 'me'), null);
  assert.deepEqual(namedEventOf({ eventName: 'e', payload: { a: 1 } }, 'me'), { eventName: 'e', payload: { a: 1, __source: 'me' } });
  assert.deepEqual(namedEventOf({ eventName: 'e', detail: { a: 1 } }, ''), { eventName: 'e', payload: { a: 1 } });
  assert.deepEqual(namedEventOf({ eventName: 'e', payload: [1] }, 'me'), { eventName: 'e', payload: [1] });
  assert.deepEqual(namedEventOf({ eventName: 'e', payload: 'x' }, 'me'), { eventName: 'e', payload: 'x' });
  assert.deepEqual(namedEventOf({ eventName: 'e' }, 'me'), { eventName: 'e', payload: null });
});

test('an app home falls back to the app type; search defaults fill only what is missing', () => {
  assert.deepEqual(appHomeOf({ homeRoute: '/h', homeConsumedRoute: '', serverSideType: 'App' }), { route: '/h', consumedRoute: '', serverSideType: 'App' });
  assert.deepEqual(appHomeOf({ homeServerSideType: 'Home', serverSideType: 'App' }).serverSideType, 'Home');
  const s: Record<string, unknown> = { page: 2 };
  seedSearchDefaults(s);
  assert.deepEqual(s, { page: 2, size: 10, sort: [], searchText: '' });
});

test('messages as toasts: no text no toast, info default, undo with its label and parameters', () => {
  assert.equal(toastOf({ title: 'x' }), null);
  assert.deepEqual(toastOf({ text: 'Hi' }), { title: null, text: 'Hi', variant: 'info', duration: undefined, undo: undefined });
  assert.deepEqual(toastOf({ text: 'Deleted', title: 'T', variant: 'warning', duration: 4000, undoActionId: 'restore', undoParameters: { id: 1 } }), {
    title: 'T', text: 'Deleted', variant: 'warning', duration: 4000, undo: { label: 'Undo', actionId: 'restore', parameters: { id: 1 } },
  });
  assert.deepEqual(toastOf({ text: 'D', duration: -1, undoActionId: 'r', undoLabel: 'Revert' })!.undo, { label: 'Revert', actionId: 'r', parameters: {} });
});
