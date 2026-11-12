import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PUSH_REGISTER,
  PUSH_UNREGISTER,
  PushRegistrations,
  disablePush,
  enablePush,
  isExpoPushToken,
  newPushKey,
  onPushOpened,
  resetLaunchHandledForTests,
  setPushPort,
  pushTargetOf,
  pushPort,
  pushTexts,
  recordOfPush,
  refreshPush,
  type PushHost,
  type PushPort,
} from './pushNotifications.ts';
import type { NotificationPermission } from './osNotifications.ts';
import type { KeyValueStore } from './sessionId.ts';

const TOKEN = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
const ROTATED = 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyy]';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
}

function device(permission: NotificationPermission, token: string | null = TOKEN) {
  let current = permission;
  let asked = 0;
  const port: PushPort & { tokenValue: string | null } = {
    platform: 'android',
    tokenValue: token,
    permission: async () => current,
    request: async () => {
      asked++;
      current = 'granted';
      return current;
    },
    token: async () => port.tokenValue,
    onOpened: () => () => undefined,
    onReceived: () => () => undefined,
    launchedBy: async () => null,
  };
  return { port, asked: () => asked };
}

function host(baseUrl = 'https://a.example', fail = false) {
  const calls: { actionId: string; parameters: Record<string, unknown> }[] = [];
  const h: PushHost = {
    baseUrl,
    route: '',
    serverSideType: 'com.acme.App',
    run: async (actionId, parameters) => {
      calls.push({ actionId, parameters });
      if (fail) throw new Error('offline');
      return {};
    },
  };
  return { host: h, calls };
}

test('only Expo push tokens are accepted', () => {
  assert.ok(isExpoPushToken(TOKEN));
  assert.ok(isExpoPushToken('ExpoPushToken[abcdefgh12]'));
  assert.ok(!isExpoPushToken('ExponentPushToken[ab]'));
  assert.ok(!isExpoPushToken('fcm:abc'));
  assert.ok(!isExpoPushToken(null));
});

test('a push key is opaque, secure-random and different each time', () => {
  const a = newPushKey();
  const b = newPushKey();
  assert.match(a, /^p[0-9a-f]{32}$/);
  assert.notEqual(a, b);
});

test("a push's target: our key and a mount-relative route — anything else opens nothing", () => {
  assert.deepEqual(pushTargetOf({ mateu: { ui: 'p0123456789', route: '/orders/42' } }), { key: 'p0123456789', route: '/orders/42' });
  assert.deepEqual(pushTargetOf({ mateu: { ui: 'p0123456789', route: 'orders' } }), { key: 'p0123456789', route: '/orders' });
  // an absolute, protocol-relative or traversing route is dropped: the UI opens where it opens
  for (const route of ['https://evil.example', '//evil.example/x', 'javascript:alert(1)', '/a/../b']) {
    assert.deepEqual(pushTargetOf({ mateu: { ui: 'p0123456789', route } }), { key: 'p0123456789', route: '' });
  }
  assert.equal(pushTargetOf({ mateu: { ui: 'short' } }), null);
  assert.equal(pushTargetOf({ mateu: { ui: '../x/../yyyy' } }), null);
  assert.equal(pushTargetOf({ route: '/x' }), null);
  assert.equal(pushTargetOf(null), null);
  // the local notifications' data (core/osNotifications.ts) is not a push
  assert.equal(pushTargetOf({ route: '/x', scope: 'https://a.example' }), null);
});

test('turning it on asks the OS from the tap, registers with THAT UI only, then keeps the key', async () => {
  const regs = new PushRegistrations(memoryStore());
  const { port, asked } = device('undetermined');
  const { host: a, calls } = host();
  assert.equal(await enablePush(a, regs, port), 'enabled');
  assert.equal(asked(), 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].actionId, PUSH_REGISTER);
  const record = await regs.forBaseUrl('https://a.example');
  assert.ok(record);
  assert.deepEqual(calls[0].parameters, { token: TOKEN, service: 'expo', platform: 'android', uiKey: record.key });
  assert.equal(record.serverSideType, 'com.acme.App');
  // turning it on again keeps the same key
  await enablePush(a, regs, port);
  assert.equal((await regs.forBaseUrl('https://a.example'))?.key, record.key);
});

test('each UI gets its own key: a push for one never opens the other', async () => {
  const regs = new PushRegistrations(memoryStore());
  const { port } = device('granted');
  await enablePush(host('https://a.example').host, regs, port);
  await enablePush(host('https://b.example').host, regs, port);
  const a = await regs.forBaseUrl('https://a.example');
  const b = await regs.forBaseUrl('https://b.example');
  assert.notEqual(a?.key, b?.key);
  const found = await recordOfPush({ mateu: { ui: b!.key, route: '/x' } }, regs);
  assert.equal(found?.record.baseUrl, 'https://b.example');
  assert.equal(found?.route, '/x');
  assert.equal(await recordOfPush({ mateu: { ui: 'p' + '0'.repeat(32) } }, regs), null);
});

test('a refused permission, no token or a backend that refuses keep nothing', async () => {
  const regs = new PushRegistrations(memoryStore());
  const denied: PushPort = { ...device('denied').port, request: async () => 'denied' };
  assert.equal(await enablePush(host().host, regs, denied), 'denied');
  assert.equal(await enablePush(host().host, regs, device('granted', null).port), 'unavailable');
  assert.equal(await enablePush(host('https://a.example', true).host, regs, device('granted').port), 'failed');
  const web: PushPort = { ...device('granted').port, platform: null };
  assert.equal(await enablePush(host().host, regs, web), 'unavailable');
  assert.deepEqual(await regs.list(), []);
});

test('turning it off forgets the key first and tells the backend, even when the backend is down', async () => {
  const regs = new PushRegistrations(memoryStore());
  const { port } = device('granted');
  await enablePush(host().host, regs, port);
  const key = (await regs.forBaseUrl('https://a.example'))!.key;
  const { host: down, calls } = host('https://a.example', true);
  await disablePush('https://a.example', regs, down);
  assert.equal(calls[0].actionId, PUSH_UNREGISTER);
  assert.equal(calls[0].parameters['uiKey'], key);
  assert.equal(await regs.forBaseUrl('https://a.example'), undefined);
  // the hub builds its host from the record (no screen open): never for another backend
  await enablePush(host().host, regs, port);
  const other = host('https://b.example');
  await disablePush('https://a.example', regs, () => other.host);
  assert.equal(other.calls.length, 0);
});

test('every start re-registers a UI turned on (the token may rotate) and never asks again', async () => {
  const regs = new PushRegistrations(memoryStore());
  const d = device('granted');
  await enablePush(host().host, regs, d.port);
  d.port.tokenValue = ROTATED;
  const { host: a, calls } = host();
  assert.equal(await refreshPush(a, regs, d.port), true);
  assert.equal(calls[0].parameters['token'], ROTATED);
  assert.equal((await regs.forBaseUrl('https://a.example'))?.token, ROTATED);
  assert.equal(d.asked(), 0);
  // not turned on: nothing is sent; a permission withdrawn in the settings: nothing either
  assert.equal(await refreshPush(host('https://b.example').host, regs, d.port), false);
  assert.equal(await refreshPush(a, regs, device('denied').port), false);
});

test('stored registrations are re-validated', async () => {
  const store = memoryStore();
  store.data.set('mateu.push.registrations', JSON.stringify([
    { key: 'p0123456789', baseUrl: 'https://a.example', token: TOKEN, platform: 'ios', route: '', serverSideType: null },
    { key: 'bad', baseUrl: 'https://b.example', token: TOKEN, platform: 'ios' },
    { key: 'p9876543210', baseUrl: 'https://c.example', token: 'nope', platform: 'ios' },
  ]));
  const list = await new PushRegistrations(store).list();
  assert.deepEqual(list.map((r) => r.baseUrl), ['https://a.example']);
  store.data.set('mateu.push.registrations', '{not json');
  assert.deepEqual(await new PushRegistrations(store).list(), []);
});

test('the switch speaks English and Spanish', () => {
  assert.equal(pushTexts('es-ES').label, 'Notificaciones en este teléfono');
  assert.equal(pushTexts('en-GB').label, 'Notifications on this phone');
  assert.equal(pushTexts(undefined).label, 'Notifications on this phone');
});

test('a tap opens the UI of its key at its route; the launching push is opened once per process', async () => {
  const registrations = new PushRegistrations(memoryStore());
  const d = device('granted');
  const a = host('https://a.example');
  await enablePush(a.host, registrations, d.port);
  const key = (await registrations.forBaseUrl('https://a.example'))!.key;
  let tap: ((data: unknown) => void) | null = null;
  const port: PushPort = {
    ...d.port,
    onOpened: (l) => {
      tap = l;
      return () => {
        tap = null;
      };
    },
    launchedBy: async () => ({ mateu: { ui: key, route: '/orders/7' } }),
  };
  resetLaunchHandledForTests();
  const opened: string[] = [];
  const off = onPushOpened(registrations, (r, route) => opened.push(`${r.baseUrl}${route}`), port);
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(opened, ['https://a.example/orders/7']);
  tap!({ mateu: { ui: key } });
  tap!({ mateu: { ui: 'punknownkey000000' } });
  tap!({ route: '/x', scope: 'https://a.example' });
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(opened, ['https://a.example/orders/7', 'https://a.example']);
  off();
  // a second listener (a remount) does not reopen the launching push
  const again: string[] = [];
  const off2 = onPushOpened(registrations, (r, route) => again.push(r.baseUrl + route), port);
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(again, []);
  off2();
});

test('a UI removed with no screen open is unregistered through a host built for it', async () => {
  const registrations = new PushRegistrations(memoryStore());
  const d = device('granted');
  const a = host('https://a.example');
  await enablePush(a.host, registrations, d.port);
  const later = host('https://a.example');
  await disablePush('https://a.example', registrations, async () => later.host);
  assert.equal(await registrations.forBaseUrl('https://a.example'), undefined);
  assert.equal(later.calls[0].actionId, PUSH_UNREGISTER);
  // a host for another backend never gets this UI's token
  await enablePush(a.host, registrations, d.port);
  const other = host('https://b.example');
  await disablePush('https://a.example', registrations, async () => other.host);
  assert.equal(other.calls.length, 0);
});

test('without a platform binding push is simply unavailable, and nothing is registered', async () => {
  const previous = pushPort();
  setPushPort(null);
  try {
    const none = pushPort();
    assert.equal(none.platform, null);
    assert.equal(await none.permission(), 'unavailable');
    assert.equal(await none.request(), 'unavailable');
    assert.equal(await none.token(), null);
    assert.equal(await none.launchedBy(), null);
    none.onOpened(() => undefined)();
    none.onReceived(() => undefined)();
    const regs = new PushRegistrations(memoryStore());
    const { host: h, calls } = host();
    assert.equal(await enablePush(h, regs), 'unavailable');
    assert.equal(calls.length, 0);
    assert.deepEqual(await regs.list(), []);
  } finally {
    setPushPort(previous);
  }
});

test('the switch hears registrations change until it unsubscribes', async () => {
  const regs = new PushRegistrations(memoryStore());
  let changes = 0;
  const off = regs.subscribe(() => changes++);
  await enablePush(host().host, regs, device('granted').port);
  assert.equal(changes, 1);
  off();
  await regs.remove('https://a.example');
  assert.equal(changes, 1);
  assert.deepEqual(await regs.list(), []);
});

test('a re-registration the backend refuses keeps the stored record as it was', async () => {
  const regs = new PushRegistrations(memoryStore());
  const d = device('granted');
  await enablePush(host().host, regs, d.port);
  d.port.tokenValue = ROTATED;
  assert.equal(await refreshPush(host('https://a.example', true).host, regs, d.port), false);
  assert.equal((await regs.forBaseUrl('https://a.example'))?.token, TOKEN);
});
