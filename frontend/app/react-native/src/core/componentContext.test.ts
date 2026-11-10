// What the view controller reads off a component (componentContext.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  actionFlagsOf, actionTargetOf, appHomeOf, fieldErrorsOf, routeQueryOf, seedSearchFromRoute, namedEventOf, orchestratorOf,
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
  assert.deepEqual(triggerPlanOf(undefined), { autoSave: null, subscriptions: [], valueChanges: [] });
});

test('OnValueChange: an edit of the named field (or any, when unnamed) runs the action whose condition holds', async () => {
  const { valueChangeActionsOf } = await import('./componentContext.ts');
  const { valueChanges } = triggerPlanOf([
    { type: 'OnValueChange', actionId: 'countryChanged', propertyName: 'country', condition: '' },
    { type: 'OnValueChange', actionId: 'recalculate', propertyName: 'quantity' },
    { type: 'OnValueChange', actionId: 'anyEdit' },
    { type: 'OnValueChange', actionId: 'onlyBig', propertyName: 'quantity', condition: 'state.quantity > 10' },
  ]);
  const holds = (c: string) => c !== 'state.quantity > 10';
  assert.deepEqual(valueChangeActionsOf(valueChanges, 'country', holds), ['countryChanged', 'anyEdit']);
  assert.deepEqual(valueChangeActionsOf(valueChanges, 'quantity', holds), ['recalculate', 'anyEdit']);
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
  assert.deepEqual(toastOf({ text: 'Hi' }), { title: null, text: 'Hi', variant: 'info', duration: undefined, undo: undefined, actions: [], persistence: 'toast', key: null });
  // an older server: the legacy undo fields become the one action
  assert.deepEqual(toastOf({ text: 'Deleted', title: 'T', variant: 'warning', duration: 4000, undoActionId: 'restore', undoParameters: { id: 1 } }), {
    title: 'T', text: 'Deleted', variant: 'warning', duration: 4000, undo: { label: 'Undo', actionId: 'restore', parameters: { id: 1 } },
    actions: [{ label: 'Undo', actionId: 'restore', parameters: { id: 1 }, route: null, style: 'undo' }], persistence: 'toast', key: null,
  });
  assert.deepEqual(toastOf({ text: 'D', duration: -1, undoActionId: 'r', undoLabel: 'Revert' })!.undo, { label: 'Revert', actionId: 'r', parameters: {} });
});

test('message semantics: actions win over the legacy undo, persistence, key; an older error is sticky', () => {
  const t = toastOf({
    text: 'Saved', persistence: 'inbox', key: 'k1', undoActionId: 'legacy',
    actions: [{ label: 'Open', route: '/x' }, { style: 'undo', actionId: 'restore' }, { label: 'Nothing' }],
  })!;
  assert.deepEqual(t.actions.map((a) => a.label), ['Open', 'Undo'], 'an action with nowhere to go is dropped');
  assert.equal(t.undo!.actionId, 'restore', 'not the legacy field');
  assert.equal(t.persistence, 'inbox');
  assert.equal(t.key, 'k1');
  assert.equal(toastOf({ text: 'x', variant: 'error' })!.persistence, 'sticky');
  assert.equal(toastOf({ text: 'x', variant: 'error', persistence: 'toast' })!.persistence, 'toast');
});

test('a route\'s query seeds a listing\'s search, under what the user set', () => {
  assert.deepEqual(routeQueryOf('reservas?vista=LLEGADAS_HOY&page=2&q=ana%20b'), { vista: 'LLEGADAS_HOY', page: 2, searchText: 'ana b' });
  assert.deepEqual(routeQueryOf('reservas'), {});
  assert.deepEqual(routeQueryOf('x?page=-1&bad=%E0%A4%A&=v'), {});
  const s: Record<string, unknown> = { vista: 'IN_HOUSE' };
  seedSearchFromRoute(s, 'reservas?vista=LLEGADAS_HOY&hotel=MRU01');
  assert.deepEqual(s, { vista: 'IN_HOUSE', hotel: 'MRU01', page: 0, size: 10, sort: [], searchText: '' });
});

test('floating components: a Notification toasts, a Dialog/ConfirmDialog/Drawer opens as an overlay once something is on screen', async () => {
  const { floatingIntentOf, notificationToastOf } = await import('./componentContext.ts');
  const n = (type: string) => ({ type: 'ClientSide', metadata: { type } });
  assert.equal(floatingIntentOf('Replace', n('Notification'), true), 'toast');
  assert.equal(floatingIntentOf('Replace', n('ConfirmDialog'), true), 'overlay');
  assert.equal(floatingIntentOf('Add', n('Drawer'), false), 'overlay');
  // a screen that IS a dialog (nothing on screen yet), or any other component, renders in place
  assert.equal(floatingIntentOf('Replace', n('Dialog'), false), null);
  assert.equal(floatingIntentOf('Replace', n('Form'), true), null);
  assert.equal(floatingIntentOf('Replace', { type: 'ServerSide', metadata: { type: 'Dialog' } }, true), null);
  assert.deepEqual(notificationToastOf({ title: 'Saved', text: 'All good', theme: 'error' }), { title: 'Saved', text: 'All good', variant: 'error', duration: undefined });
  assert.deepEqual(notificationToastOf({ title: 'Only a title' }), { title: null, text: 'Only a title', variant: 'info', duration: undefined });
});
