import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  actionEffects,
  getActionCatalogue,
  inAppRoute,
  isClientRunnable,
  isRuleLeaf,
  menuLeafEffects,
  registerActionCatalogue,
  resolveAction,
  shellFlowFor,
  type ShellAction,
} from './shellFlows.ts';

// The wire App's `actions`, as AppShellFlowSyncTest pins them (steps lowered to commands).
const actions: ShellAction[] = [
  {
    id: 'newOrder',
    commands: [
      { type: 'MarkAsClean', data: null },
      { type: 'NavigateTo', data: 'orders/new' },
    ],
  },
  { id: 'announce', commands: [{ type: 'DispatchEvent', data: { eventName: 'order-started', detail: null } }] },
  { id: 'serverOnly' },
];

const leaf = (actionId: string) => ({ rules: [{ action: 'RunAction', actionId }] });

test('a menu leaf naming a shell flow applies its commands client-side', () => {
  assert.deepEqual(menuLeafEffects(leaf('newOrder'), actions), [{ kind: 'navigate', route: 'orders/new' }]);
  assert.deepEqual(menuLeafEffects(leaf('announce'), actions), [{ kind: 'event', eventName: 'order-started', payload: null }]);
});

test('an id without steps (or undeclared) keeps the server dispatch', () => {
  assert.deepEqual(menuLeafEffects(leaf('serverOnly'), actions), [{ kind: 'runAction', actionId: 'serverOnly' }]);
  assert.deepEqual(menuLeafEffects(leaf('nope'), undefined), [{ kind: 'runAction', actionId: 'nope' }]);
});

test('a URL destination leaves the app; a relative or slashed route stays in it', () => {
  const flow: ShellAction[] = [
    { id: 'docs', commands: [{ type: 'NavigateTo', data: 'https://example.com/docs' }] },
    { id: 'abs', commands: [{ type: 'NavigateTo', data: '/customers' }, { type: 'RunAction', data: { actionId: 'refresh' } }, { type: 'CloseModal', data: null }] },
  ];
  assert.deepEqual(menuLeafEffects(leaf('docs'), flow), [{ kind: 'url', url: 'https://example.com/docs' }]);
  assert.deepEqual(menuLeafEffects(leaf('abs'), flow), [
    { kind: 'navigate', route: 'customers' },
    { kind: 'runAction', actionId: 'refresh' },
    { kind: 'closeOverlay' },
  ]);
  assert.equal(inAppRoute('//evil.com/x'), undefined);
  assert.equal(inAppRoute('mailto:a@b.c'), undefined);
});

test('helpers', () => {
  assert.equal(isRuleLeaf(leaf('x')), true);
  assert.equal(isRuleLeaf({ rules: [] }), false);
  assert.equal(isRuleLeaf({}), false);
  assert.equal(shellFlowFor(actions, 'serverOnly'), undefined);
  assert.equal(shellFlowFor(actions, 'newOrder')?.length, 2);
});

// ── the app's ACTION catalogue (AppDto.actionCatalogue, as ActionCatalogueSyncTest pins it) ─────
const catalogue: ShellAction[] = [
  { id: 'newOrder', commands: [{ type: 'MarkAsClean', data: null }, { type: 'NavigateTo', data: 'orders/new' }] },
  { id: 'refreshCustomers', restAction: { source: { url: 'https://example.test/api/customers', method: 'POST' }, successMessage: 'Refreshed' } },
  { id: 'announce', commands: [{ type: 'DispatchEvent', data: { eventName: 'catalogue-announce' } }] },
  { id: 'chained', commands: [{ type: 'RunAction', data: { actionId: 'newOrder' } }] },
];

test('a menu leaf naming an id the shell does not declare runs the catalogue entry', () => {
  assert.deepEqual(menuLeafEffects(leaf('chained'), [], catalogue), [{ kind: 'navigate', route: 'orders/new' }]);
  assert.deepEqual(menuLeafEffects(leaf('refreshCustomers'), undefined, catalogue), [
    { kind: 'restAction', actionId: 'refreshCustomers', restAction: catalogue[1].restAction! },
  ]);
});

test('owner first: the shell action of the same id wins over the catalogue', () => {
  assert.deepEqual(menuLeafEffects(leaf('announce'), actions, catalogue), [
    { kind: 'event', eventName: 'order-started', payload: null },
  ]);
  // an owner entry WITHOUT a flow is the owner's server action — the catalogue does not shadow it
  const owner: ShellAction[] = [{ id: 'newOrder' }];
  assert.equal(resolveAction('newOrder', owner, catalogue), owner[0]);
  assert.equal(isClientRunnable(resolveAction('newOrder', owner, catalogue)), false);
  assert.deepEqual(actionEffects('newOrder', owner, catalogue), [{ kind: 'runAction', actionId: 'newOrder' }]);
});

test('an id nobody knows stays a server dispatch; a self-referencing flow cannot loop', () => {
  assert.deepEqual(menuLeafEffects(leaf('nope'), actions, catalogue), [{ kind: 'runAction', actionId: 'nope' }]);
  const loop: ShellAction[] = [{ id: 'loop', commands: [{ type: 'RunAction', data: { actionId: 'loop' } }] }];
  assert.deepEqual(actionEffects('loop', [], loop), [{ kind: 'runAction', actionId: 'loop' }]);
});

test('the registered catalogue is what a page controller resolves against', () => {
  registerActionCatalogue(catalogue);
  assert.equal(getActionCatalogue().length, 4);
  assert.equal(resolveAction('refreshCustomers', [{ id: 'save' }])?.restAction, catalogue[1].restAction);
  registerActionCatalogue(undefined);
  assert.deepEqual(getActionCatalogue(), []);
});
