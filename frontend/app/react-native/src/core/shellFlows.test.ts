import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inAppRoute, isRuleLeaf, menuLeafEffects, shellFlowFor, type ShellAction } from './shellFlows.ts';

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
