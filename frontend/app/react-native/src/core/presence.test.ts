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

test('three or more people are summarised; a non-record screen reports nothing; a failed report is tolerated', async () => {
  assert.deepEqual(presenceSummary([{ name: 'a', editing: false }, { name: 'b', editing: false }, { name: 'c', editing: false }, { name: 'd', editing: false }]), {
    text: 'a, b and 2 more are viewing it',
    tone: 'neutral',
  });
  const sent: Record<string, unknown>[] = [];
  const hub = new PresenceHub(async (body) => {
    sent.push(body.parameters);
    throw new Error('offline');
  });
  assert.equal(hub.enabled, false);
  assert.equal(hub.rootRoute, '');
  hub.configure({ presence: true, rootRoute: '/desk' });
  assert.equal(hub.enabled, true);
  assert.equal(hub.rootRoute, '/desk');
  hub.configure({ presence: true, rootRoute: '/desk' }); // unchanged: nothing restarts
  const list = hub.watch('orders', 'V', false, false, () => undefined);
  list.setEditing(true);
  list.stop();
  assert.equal(sent.length, 0);
  const record = hub.watch('orders/7', 'V', false, false, () => undefined);
  record.setEditing(false); // unchanged: not sent again
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(sent.length, 1);
  record.stop();
  record.stop(); // twice: one leave
  assert.deepEqual(sent.map((p) => p.state), ['viewing', 'leave']);
  hub.configure(null);
});
