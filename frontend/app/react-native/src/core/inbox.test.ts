import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catchUpOnResume, filtered, grouped, inboxChangeOf, inboxItemOf, InboxStore, unreadCount } from './inbox.ts';

const item = (id: string, over: Record<string, unknown> = {}) => inboxItemOf({ id, title: `T ${id}`, unread: true, ...over })!;

test('an entry is read from the wire; no id, no entry', () => {
  const i = inboxItemOf({ id: 'n1', title: 'Approve', category: 'Purchases', variant: 'warning', resolved: false, hasDetail: true, actions: [{ label: 'Approve', actionId: 'approve' }] });
  assert.equal(i!.category, 'Purchases');
  assert.equal(i!.hasDetail, true);
  assert.equal(i!.unread, true, 'unread unless the server says otherwise');
  assert.equal(i!.actions!.length, 1);
  assert.equal(inboxItemOf({ title: 'x' }), null);
});

test('filters, groups and the badge', () => {
  const items = [item('a', { category: 'Orders' }), item('b', { unread: false }), item('c', { resolved: true, category: 'Orders' }), item('d', { category: 'Orders' })];
  assert.deepEqual(filtered(items, 'unread').map((i) => i.id), ['a', 'd']);
  assert.deepEqual(filtered(items, 'all').map((i) => i.id), ['a', 'b', 'd']);
  assert.deepEqual(filtered(items, 'resolved').map((i) => i.id), ['c']);
  assert.deepEqual(grouped(filtered(items, 'all')).map((g) => [g.category, g.items.map((i) => i.id)]), [['Orders', ['a', 'd']], ['', ['b']]]);
  assert.equal(unreadCount(items), 2, 'a resolved entry does not count');
});

test('NotificationsChanged: upsert, remove, or fetch again', () => {
  assert.equal(inboxChangeOf({ notification: { id: 'x', title: 'X' } }).kind, 'upsert');
  assert.deepEqual(inboxChangeOf({ removedId: 'x' }), { kind: 'remove', id: 'x' });
  assert.deepEqual(inboxChangeOf({}), { kind: 'refetch' });
  assert.deepEqual(inboxChangeOf(null), { kind: 'refetch' });
});

test('the inbox is the server list plus the session entries, deduplicated by id', () => {
  const inbox = new InboxStore();
  const heard: string[] = [];
  inbox.subscribe((c) => heard.push(c?.kind ?? 'change'));
  inbox.setServer([item('s1'), item('s2')]);
  inbox.addSession({ ...item('m1'), local: true });
  inbox.apply({ kind: 'upsert', item: item('p1') });
  assert.deepEqual(inbox.items().map((i) => i.id), ['p1', 'm1', 's1', 's2'], 'session entries first, newest on top');
  // a push of a known id replaces it in place
  inbox.apply({ kind: 'upsert', item: item('s1', { title: 'changed' }) });
  assert.equal(inbox.items().find((i) => i.id === 's1')!.title, 'changed');
  assert.equal(inbox.items().length, 4);
  // the server list now knows the pushed entry: one copy
  inbox.setServer([item('s1'), item('s2'), item('p1')]);
  assert.deepEqual(inbox.items().map((i) => i.id), ['m1', 's1', 's2', 'p1']);
  inbox.apply({ kind: 'remove', id: 's2' });
  assert.ok(!inbox.items().find((i) => i.id === 's2'));
  assert.equal(inbox.apply({ kind: 'refetch' }).kind, 'refetch');
  assert.ok(heard.includes('refetch') && heard.includes('upsert'));
});

test('read and dismissed entries', () => {
  const inbox = new InboxStore();
  inbox.setServer([item('a'), item('b')]);
  inbox.addSession({ ...item('m'), local: true });
  inbox.markRead(['a']);
  assert.equal(unreadCount(inbox.items()), 2);
  inbox.markRead('all');
  assert.equal(unreadCount(inbox.items()), 0);
  inbox.dismiss(['b', 'm']);
  assert.deepEqual(inbox.items().map((i) => i.id), ['a']);
  // a session entry added again with the same key comes back (a new message of that key)
  inbox.addSession({ ...item('m'), local: true });
  assert.deepEqual(inbox.items().map((i) => i.id), ['m', 'a']);
});

const fakeAppState = (currentState: string | null = 'active') => {
  const listeners = new Set<(next: string) => void>();
  return {
    currentState,
    addEventListener: (_: 'change', l: (next: string) => void) => {
      listeners.add(l);
      return { remove: () => listeners.delete(l) };
    },
    emit: (next: string) => listeners.forEach((l) => l(next)),
    listening: () => listeners.size,
  };
};

test('coming back to the foreground fetches the inbox again, once per return', () => {
  const app = fakeAppState();
  let fetched = 0;
  catchUpOnResume(app, () => fetched++);

  app.emit('inactive');
  app.emit('background');
  assert.equal(fetched, 0, 'nothing while it is away');
  app.emit('active');
  assert.equal(fetched, 1);
  app.emit('active');
  assert.equal(fetched, 1, 'a repeated active is not a return');
  app.emit('inactive');
  app.emit('active');
  assert.equal(fetched, 2, 'iOS: the stream closes on inactive too');
});

test('an app that starts away catches up on its first activation, and stops when unsubscribed', () => {
  const app = fakeAppState('background');
  let fetched = 0;
  const off = catchUpOnResume(app, () => fetched++);
  app.emit('active');
  assert.equal(fetched, 1);

  off();
  assert.equal(app.listening(), 0);
  app.emit('background');
  app.emit('active');
  assert.equal(fetched, 1);
});
