import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HeaderValuesStore, headerChangesOf, idlePhase, launchableShortcuts, parseSseChunk, quickLaunchMatch, reconnectDelay,
  signOutTarget,
} from './appShellExtras.ts';

const shortcuts = [
  { key: 'f9', label: 'Merge profiles', route: '/e2-demo/merge', code: 'MRG' },
  { key: 'alt+m', label: 'Merge profiles', route: '/e2-demo/merge' },
  { code: 'SYNC', label: 'Sync channels', actionId: 'syncChannels' },
  { code: 'NOWHERE', label: 'Nowhere' },
];

test('quick launch goes by exact code, case-insensitive; a key alone is not launchable on a phone', () => {
  assert.equal(quickLaunchMatch(shortcuts, ' mrg ')?.route, '/e2-demo/merge');
  assert.equal(quickLaunchMatch(shortcuts, 'sync')?.actionId, 'syncChannels');
  assert.equal(quickLaunchMatch(shortcuts, 'MR'), undefined);
  assert.equal(quickLaunchMatch(shortcuts, 'nowhere'), undefined);
  assert.equal(quickLaunchMatch(shortcuts, ''), undefined);
  assert.deepEqual(launchableShortcuts(shortcuts).map((s) => s.code), ['MRG', 'SYNC']);
});

test('the header values store is seeded, changed by id keeping the label, and says what changed', () => {
  const store = new HeaderValuesStore();
  let calls = 0;
  store.subscribe(() => calls++);
  store.seed([{ id: 'businessDate', label: 'Business date', value: '12 Oct' }]);
  assert.equal(store.update('businessDate', '13 Oct'), 'Business date changed to 13 Oct');
  assert.deepEqual(store.list(), [{ id: 'businessDate', label: 'Business date', value: '13 Oct' }]);
  assert.equal(store.update('businessDate', '13 Oct'), null);
  store.seed([{ id: 'businessDate', label: 'Business date', value: '13 Oct' }]);
  assert.equal(calls, 2);
});

test('the event stream: header changes of an increment, SSE chunking, reconnect back-off', () => {
  assert.deepEqual(
    headerChangesOf({ commands: [{ type: 'UpdateHeaderValue', data: { id: 'shift', value: 'Night' } }, { type: 'NavigateTo', data: '/x' }] }),
    [{ id: 'shift', value: 'Night' }],
  );
  const { increments, rest } = parseSseChunk('data: {"commands":[]}\n\ndata:{"a":1}\n\ndata: {"par');
  assert.deepEqual(increments, [{ commands: [] }, { a: 1 }]);
  assert.equal(rest, 'data: {"par');
  assert.equal(reconnectDelay(0), 1000);
  assert.equal(reconnectDelay(3), 8000);
  assert.equal(reconnectDelay(50), 60000);
});

test('idle: active, then a warning with the seconds left, then expired', () => {
  const idle = { timeoutSeconds: 60, warningSeconds: 20 };
  assert.deepEqual(idlePhase(30_000, 0, idle), { phase: 'active', secondsLeft: 30 });
  assert.deepEqual(idlePhase(45_000, 0, idle), { phase: 'warning', secondsLeft: 15 });
  assert.deepEqual(idlePhase(60_000, 0, idle), { phase: 'expired', secondsLeft: 0 });
});

test('sign out opens an absolute url, otherwise resets the app', () => {
  assert.deepEqual(signOutTarget('https://idp.example.com/logout'), { kind: 'url', url: 'https://idp.example.com/logout' });
  assert.deepEqual(signOutTarget('/signed-out-demo'), { kind: 'root' });
  assert.deepEqual(signOutTarget(null), { kind: 'root' });
});
