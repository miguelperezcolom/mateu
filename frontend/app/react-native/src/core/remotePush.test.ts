import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { NotificationPermission } from './osNotifications.ts';
import {
  REFRESH_AFTER_MS,
  REGISTER_ACTION,
  UNREGISTER_ACTION,
  hubHandlesPushTaps,
  isRemoteTrigger,
  pushDeviceId,
  pushTargetOf,
  pushTokenSource,
  readRegistrations,
  registeredIn,
  sameUi,
  setHubHandlesPushTaps,
  setPushTokenSource,
  syncPushRegistration,
  unregisterPush,
  type PushSyncContext,
} from './remotePush.ts';
import type { KeyValueStore } from './sessionId.ts';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => { data.set(k, v); },
    remove: async (k) => { data.delete(k); },
  };
}

const UI = 'https://ops.example.com/app';
const answer = (registered: boolean) => ({ fragments: [{ data: { _push: { registered } } }] });

function context(overrides: Partial<PushSyncContext> & { permission?: NotificationPermission } = {}) {
  const calls: { actionId: string; parameters: Record<string, unknown> }[] = [];
  let token = 'ExponentPushToken[a]';
  let permission: NotificationPermission = overrides.permission ?? 'granted';
  let now = 1_000_000;
  const store = memoryStore();
  const ctx: PushSyncContext = {
    baseUrl: UI,
    enabled: true,
    permission: async () => permission,
    token: async () => ({ token, platform: 'android' }),
    deviceId: async () => 'device-1',
    run: async (actionId, parameters) => {
      calls.push({ actionId, parameters });
      return actionId === REGISTER_ACTION ? answer(true) : answer(false);
    },
    store,
    dispatch: { route: '/app', serverSideType: 'com.example.App' },
    now: () => now,
    ...overrides,
  };
  return {
    ctx,
    calls,
    store,
    setToken: (t: string) => { token = t; },
    setPermission: (p: NotificationPermission) => { permission = p; },
    advance: (ms: number) => { now += ms; },
  };
}

test('a granted, enabled UI registers its token with the phone\'s details', async () => {
  const { ctx, calls, store } = context();
  assert.equal(await syncPushRegistration(ctx), 'registered');
  assert.deepEqual(calls, [{
    actionId: REGISTER_ACTION,
    parameters: { token: 'ExponentPushToken[a]', platform: 'android', deviceId: 'device-1', ui: UI },
  }]);
  const recorded = (await readRegistrations(store))[UI];
  assert.equal(recorded.token, 'ExponentPushToken[a]');
  assert.equal(recorded.route, '/app');
  assert.equal(recorded.serverSideType, 'com.example.App');
});

test('a recent registration is not repeated; a stale one or a new token is', async () => {
  const t = context();
  await syncPushRegistration(t.ctx);
  assert.equal(await syncPushRegistration(t.ctx), 'unchanged');
  t.advance(REFRESH_AFTER_MS + 1);
  assert.equal(await syncPushRegistration(t.ctx), 'registered');
  t.setToken('ExponentPushToken[b]');
  assert.equal(await syncPushRegistration(t.ctx), 'registered');
  // the old token is forgotten before the new one is registered
  assert.deepEqual(t.calls.slice(-2).map((c) => [c.actionId, c.parameters.token]), [
    [UNREGISTER_ACTION, 'ExponentPushToken[a]'],
    [REGISTER_ACTION, 'ExponentPushToken[b]'],
  ]);
});

test('a revoked permission or an app that turned push off unregisters', async () => {
  const t = context();
  await syncPushRegistration(t.ctx);
  t.setPermission('denied');
  assert.equal(await syncPushRegistration(t.ctx), 'unregistered');
  assert.deepEqual(t.calls.at(-1), { actionId: UNREGISTER_ACTION, parameters: { token: 'ExponentPushToken[a]' } });
  assert.deepEqual(await readRegistrations(t.store), {});
  // nothing registered: nothing to say
  assert.equal(await syncPushRegistration(t.ctx), 'none');

  const off = context({ enabled: false });
  assert.equal(await syncPushRegistration(off.ctx), 'none');
  assert.equal(off.calls.length, 0);
});

test('without a token, or when the server keeps none, nothing is recorded', async () => {
  const noToken = context({ token: async () => null });
  assert.equal(await syncPushRegistration(noToken.ctx), 'none');
  assert.equal(noToken.calls.length, 0);

  const refused = context({ run: async () => answer(false) });
  assert.equal(await syncPushRegistration(refused.ctx), 'none');
  assert.deepEqual(await readRegistrations(refused.store), {});

  const broken = context({ run: async () => { throw new Error('offline'); } });
  assert.equal(await syncPushRegistration(broken.ctx), 'none');
});

test('unregisterPush forgets the record and tells the server with the recorded dispatch', async () => {
  const t = context();
  await syncPushRegistration(t.ctx);
  const told: unknown[] = [];
  assert.equal(await unregisterPush(t.store, UI, async (actionId, parameters, dispatch) => {
    told.push([actionId, parameters, dispatch.route, dispatch.serverSideType]);
  }), true);
  assert.deepEqual(told, [[UNREGISTER_ACTION, { token: 'ExponentPushToken[a]' }, '/app', 'com.example.App']]);
  assert.equal(await unregisterPush(t.store, UI, async () => undefined), false);
});

test('a push names a web UI and a path; anything else is not a target', () => {
  assert.deepEqual(pushTargetOf({ ui: UI, route: '/orders/1' }), { ui: UI, route: '/orders/1' });
  assert.deepEqual(pushTargetOf({ ui: UI }), { ui: UI, route: null });
  assert.deepEqual(pushTargetOf({ ui: UI, route: 'javascript:alert(1)' }), { ui: UI, route: null });
  assert.deepEqual(pushTargetOf({ ui: UI, route: '//evil.example.com' }), { ui: UI, route: null });
  assert.equal(pushTargetOf({ ui: 'javascript:alert(1)' }), null);
  assert.equal(pushTargetOf({ scope: UI }), null);
  assert.equal(pushTargetOf(null), null);
  assert.equal(pushTargetOf('x'), null);
});

test('only a push-service trigger is remote', () => {
  assert.equal(isRemoteTrigger({ type: 'push' }), true);
  assert.equal(isRemoteTrigger({ type: 'timeInterval' }), false);
  assert.equal(isRemoteTrigger(null), false);
});

test('helpers: same UI, device id, tap owner, token source, registration answer', async () => {
  assert.equal(sameUi(UI, UI + '/'), true);
  assert.equal(sameUi(UI, 'https://other.example.com/app'), false);

  const store = memoryStore();
  let made = 0;
  const make = () => `id-${++made}`;
  assert.equal(await pushDeviceId(store, make), 'id-1');
  assert.equal(await pushDeviceId(store, make), 'id-1');
  const failing: KeyValueStore = { get: async () => { throw new Error('x'); }, set: async () => undefined, remove: async () => undefined };
  assert.equal(await pushDeviceId(failing, make), 'id-2');

  assert.equal(hubHandlesPushTaps(), false);
  setHubHandlesPushTaps(true);
  assert.equal(hubHandlesPushTaps(), true);
  setHubHandlesPushTaps(false);

  assert.equal(await pushTokenSource().token(), null);
  setPushTokenSource({ token: async () => ({ token: 't', platform: 'ios' }) });
  assert.deepEqual(await pushTokenSource().token(), { token: 't', platform: 'ios' });
  setPushTokenSource(null);

  assert.equal(registeredIn(answer(true)), true);
  assert.equal(registeredIn({ fragments: [{ data: {} }] }), false);
  assert.equal(registeredIn(null), false);

  const corrupt = memoryStore();
  await corrupt.set('mateu.push.registrations', '{not json');
  assert.deepEqual(await readRegistrations(corrupt), {});
});
