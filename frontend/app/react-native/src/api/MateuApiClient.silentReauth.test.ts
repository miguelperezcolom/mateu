// R1 (pre-GA review): the offline queue's sends re-authenticate silently, and only as the SAME person.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';

const rq = (actionId: string, extra: Record<string, unknown> = {}) => ({
  route: '/r', consumedRoute: '', actionId, serverSideType: 'T', initiatorComponentId: 'c', componentState: {}, appState: {}, parameters: {}, ...extra,
});

function withFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  const original = globalThis.fetch;
  globalThis.fetch = impl as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

test('a queued send (silentReauth) never opens a sign-in, and is not repeated as someone else after a re-auth', async () => {
  let calls = 0;
  const restore = withFetch(async (_u, init) => {
    calls++;
    const auth = (init.headers as Record<string, string>)['Authorization'];
    return auth === 'Bearer alice-1' ? new Response('expired', { status: 401 }) : new Response('{}', { status: 200 });
  });
  try {
    // the re-auth this request joins ends with ANOTHER person signed in
    let who = 'alice';
    let logins = 0;
    const toBob = {
      getToken: async () => (who === 'alice' ? 'alice-1' : 'bob-1'),
      refresh: async () => ((who = 'bob'), true),
      login: async () => (logins++, true),
      owner: async () => who,
    };
    await assert.rejects(new MateuApiClient('http://x', 's', toBob).runAction(rq('save', { idempotencyKey: 'key-0001-aaaa', silentReauth: true })), /401/);
    assert.equal(calls, 1, 'not repeated as bob');
    assert.equal(logins, 0);

    // the same person after the refresh: repeated once, as before
    calls = 0;
    let token = 'alice-1';
    const sameAlice = {
      getToken: async () => token,
      refresh: async () => ((token = 'alice-2'), true),
      login: async () => (logins++, true),
      owner: async () => 'alice',
    };
    assert.deepEqual(await new MateuApiClient('http://x', 's', sameAlice).runAction(rq('save', { idempotencyKey: 'key-0002-aaaa', silentReauth: true })), {});
    assert.equal(calls, 2);
    assert.equal(logins, 0);
  } finally {
    restore();
  }
});

test('a queued send whose refresh fails does not open the sign-in browser', async () => {
  const restore = withFetch(async () => new Response('expired', { status: 401 }));
  try {
    let logins = 0;
    const provider = { getToken: async () => 't', refresh: async () => false, login: async () => (logins++, true), owner: async () => 'alice' };
    await assert.rejects(new MateuApiClient('http://x', 's', provider).runAction(rq('save', { idempotencyKey: 'key-0003-aaaa', silentReauth: true })), /401/);
    assert.equal(logins, 0);
  } finally {
    restore();
  }
});
