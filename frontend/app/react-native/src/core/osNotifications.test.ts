import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InboxStore } from './inbox.ts';
import { TaskCenter, progressOf } from './taskCenter.ts';
import { inboxNotificationOf, localNotifier, setLocalNotifier, taskNotificationOf, wireOsNotifications, type LocalNotifier, type NotificationPermission, type OsNotification } from './osNotifications.ts';

const tick = () => new Promise((r) => setTimeout(r, 0));

function fakeNotifier(permission: NotificationPermission) {
  const shown: OsNotification[] = [];
  let asked = 0;
  const notifier: LocalNotifier = {
    permission: async () => permission,
    request: async () => { asked++; return 'granted'; },
    show: async (n) => { shown.push(n); },
    onOpened: () => () => undefined,
  };
  return { notifier, shown, asked: () => asked };
}

function session(osNotifications = true) {
  return { osNotifications, api: { baseUrl: 'https://a.example' }, inbox: new InboxStore(), tasks: new TaskCenter() };
}

test('in the background: a NEW unread inbox entry and a background task that finished are posted', async () => {
  const { notifier, shown, asked } = fakeNotifier('granted');
  setLocalNotifier(notifier);
  const s = session();
  wireOsNotifications(s, () => false);
  s.inbox.addSession({ id: 'm1', title: 'Expense approved', text: 'Trip to Rome', unread: true, route: '/expenses/1' });
  s.inbox.addSession({ id: 'm1', title: 'Expense approved', text: 'again', unread: true });
  s.inbox.apply({ kind: 'upsert', item: { id: 'p1', title: 'Pushed', unread: true } });
  s.inbox.apply({ kind: 'upsert', item: { id: 'p2', title: 'Already read', unread: false } });
  s.tasks.upsert(progressOf({ taskId: 'bg', title: 'Import', state: 'running', blocking: false })!);
  s.tasks.upsert(progressOf({ taskId: 'bg', title: 'Import', state: 'done', text: '300 rows', resultActions: [{ label: 'Open', route: '/r' }] })!);
  s.tasks.upsert(progressOf({ taskId: 'modal', title: 'Save', state: 'running', blocking: true })!);
  s.tasks.upsert(progressOf({ taskId: 'modal', title: 'Save', state: 'done' })!);
  s.tasks.upsert(progressOf({ taskId: 'stop', title: 'X', state: 'running' })!);
  s.tasks.upsert(progressOf({ taskId: 'stop', title: 'X', state: 'cancelled' })!);
  await tick();
  assert.deepEqual(shown.map((n) => n.id), ['inbox-m1', 'inbox-p1', 'task-bg'], 'once per new entry; a waited-for or cancelled task is not news');
  assert.deepEqual(shown[0], { id: 'inbox-m1', title: 'Expense approved', body: 'Trip to Rome', route: '/expenses/1', scope: 'https://a.example' });
  assert.deepEqual(shown[2], { id: 'task-bg', title: 'Import finished', body: '300 rows', route: '/r', scope: 'https://a.example' });
  assert.equal(asked(), 0, 'the permission is never asked for on its own');
  setLocalNotifier(null);
});

test('nothing while the app is in front, without the app opting in, or without permission', async () => {
  for (const [inFront, opted, permission] of [[true, true, 'granted'], [false, false, 'granted'], [false, true, 'undetermined']] as const) {
    const { notifier, shown } = fakeNotifier(permission);
    setLocalNotifier(notifier);
    const s = session(opted);
    const off = wireOsNotifications(s, () => inFront);
    s.inbox.addSession({ id: 'm', title: 'Hi', unread: true });
    await tick();
    assert.equal(shown.length, 0, `${inFront}/${opted}/${permission}`);
    off();
  }
  setLocalNotifier(null);
});

test('a failed task says so, with its error', () => {
  const center = new TaskCenter();
  center.upsert(progressOf({ taskId: 't', title: 'Import', state: 'running' })!);
  center.upsert(progressOf({ taskId: 't', title: 'Import', state: 'failed', error: 'Row 7 is invalid' })!);
  assert.deepEqual(taskNotificationOf(center.get('t')!, 's'), { id: 'task-t', title: 'Import failed', body: 'Row 7 is invalid', route: null, scope: 's' });
  assert.equal(inboxNotificationOf({ id: 'x', title: '', text: 'Only text', unread: true }, 's').title, 'Only text');
});

test('without a platform binding nothing is asked, posted or listened to — and the wiring can be undone', async () => {
  setLocalNotifier(null);
  const none = localNotifier();
  assert.equal(await none.permission(), 'unavailable');
  assert.equal(await none.request(), 'unavailable');
  assert.equal(await none.show({ id: 'x', title: 't', body: '', scope: 's' }), undefined);
  assert.equal(none.onOpened(() => undefined)(), undefined);
  const { notifier, shown } = fakeNotifier('granted');
  setLocalNotifier(notifier);
  const s = session();
  const unwire = wireOsNotifications(s, () => false);
  unwire();
  s.inbox.addSession({ id: 'm9', title: 'After', text: '', unread: true });
  await tick();
  assert.deepEqual(shown, []);
  setLocalNotifier(null);
});
