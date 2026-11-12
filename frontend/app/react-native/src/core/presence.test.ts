import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRecordRoute, newEditors, PresenceHub, presenceChangesOf, presenceRouteOf, presenceSummary } from './presence.ts';

test('reads the PresenceChanged commands of an increment', () => {
  assert.deepEqual(presenceChangesOf({ commands: [
    { type: 'UpdateHeaderValue', data: {} },
    { type: 'PresenceChanged', data: { key: 'orders/7|V', entries: [{ name: 'ana', editing: true }] } },
  ] }), [{ key: 'orders/7|V', entries: [{ name: 'ana', editing: true }] }]);
  assert.deepEqual(presenceChangesOf(null), []);
});

test('a record screen is two segments or a screen that edits, never a create page', () => {
  assert.equal(presenceRouteOf('/app/orders/7?x=1', '/app'), 'orders/7');
  assert.equal(isRecordRoute('orders/7/edit'), true);
  assert.equal(isRecordRoute('orders/new'), false);
  assert.equal(isRecordRoute('dashboard'), false);
  assert.equal(isRecordRoute('profile', true), true);
});

test('says editors first, in a warning tone, and tells who STARTS editing', () => {
  assert.equal(presenceSummary([]), null);
  const s = presenceSummary([{ name: 'Bob', editing: false }, { name: 'Ana', editing: true }])!;
  assert.equal(s.tone, 'warning');
  assert.equal(s.text, 'Ana is editing this record · Bob is viewing it');
  assert.deepEqual(newEditors([{ name: 'Ana', editing: false }], [{ name: 'Ana', editing: true }]), ['Ana']);
});

test('the hub reports, hears the stream for its record only, and leaves', async () => {
  const sent: Record<string, unknown>[] = [];
  const hub = new PresenceHub(async (body) => {
    sent.push(body.parameters);
    return { commands: [{ type: 'PresenceChanged', data: { key: 'orders/7|V', entries: [{ name: 'bob', editing: false }] } }] };
  });
  const heard: unknown[] = [];
  hub.configure({ presence: false });
  const off = hub.watch('orders/7', 'V', false, false, () => undefined);
  assert.equal(sent.length, 0);
  off.stop();

  hub.configure({ presence: true, serverSideType: 'x.Desk', rootRoute: '/desk' });
  const watch = hub.watch('orders/7', 'V', false, false, (e) => heard.push(e));
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(sent[0], { route: 'orders/7', view: 'V', tab: sent[0].tab, state: 'viewing' });
  assert.deepEqual(heard, [[{ name: 'bob', editing: false }]]);
  hub.apply({ key: 'orders/8|V', entries: [] });
  assert.equal(heard.length, 1);
  hub.apply({ key: 'orders/7|V', entries: [{ name: 'bob', editing: true }] });
  assert.equal(heard.length, 2);
  watch.setEditing(true);
  assert.equal(sent.at(-1)!.state, 'editing');
  watch.stop();
  assert.equal(sent.at(-1)!.state, 'leave');
  hub.configure(null);
});
