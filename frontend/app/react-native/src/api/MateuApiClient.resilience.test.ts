import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';
import { RequestTimeoutError } from '../core/requestPolicy.ts';
import { connectivity } from '../core/connectivity.ts';

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

test('@Action(timeoutMillis) gives up after that long (fetch has no timeout of its own)', async () => {
  const restore = withFetch((_u, init) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  }));
  try {
    const started = Date.now();
    await assert.rejects(new MateuApiClient('http://x', 's').runAction(rq('slowCheck', { timeoutMillis: 60 })), RequestTimeoutError);
    assert.ok(Date.now() - started < 1000);
  } finally {
    restore();
  }
});

test('an idempotent read is repeated after a 5xx; a save is sent exactly once', async () => {
  let calls = 0;
  const restore = withFetch(async () => {
    calls++;
    return calls < 3 ? new Response('down', { status: 503 }) : new Response('{"fragments":[]}', { status: 200 });
  });
  try {
    const api = new MateuApiClient('http://x', 's');
    assert.deepEqual(await api.runAction(rq('flakyCheck', { idempotent: true })), { fragments: [] });
    assert.equal(calls, 3, 'two retries');
    calls = 0;
    await assert.rejects(api.runAction(rq('save')), /HTTP 503/);
    assert.equal(calls, 1, 'a write is never re-sent');
  } finally {
    restore();
  }
});

test('a request that never reached the network marks the backend unreachable; an answer marks it back', async () => {
  let fail = true;
  const restore = withFetch(async () => {
    if (fail) throw new TypeError('Failed to fetch');
    return new Response('{}', { status: 200 });
  });
  try {
    const api = new MateuApiClient('http://x', 's');
    await assert.rejects(api.runAction(rq('save')));
    assert.equal(connectivity.isOnline, false);
    fail = false;
    await api.runAction(rq('save'));
    assert.equal(connectivity.isOnline, true);
  } finally {
    restore();
  }
});

test('a queued write carries its Idempotency-Key, and with one it may be repeated after a 5xx (same key)', async () => {
  const keys: (string | null)[] = [];
  let calls = 0;
  const restore = withFetch(async (_u, init) => {
    calls++;
    keys.push(new Headers(init.headers as HeadersInit).get('Idempotency-Key'));
    return calls < 2 ? new Response('down', { status: 503 }) : new Response('{"fragments":[]}', { status: 200 });
  });
  try {
    const api = new MateuApiClient('http://x', 's');
    await api.runAction(rq('save', { idempotencyKey: 'key-0001-aaaa' }));
    assert.deepEqual(keys, ['key-0001-aaaa', 'key-0001-aaaa']);
    keys.length = 0;
    calls = 1;
    await api.runAction(rq('save'));
    assert.deepEqual(keys, [null], 'no key: no header');
  } finally {
    restore();
  }
});
