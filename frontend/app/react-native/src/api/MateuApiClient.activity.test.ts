import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';
import { serverActivity } from '../core/serverActivity.ts';
import { fetchExternalJson } from '../core/restFetch.ts';

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

test('a Mateu call counts while it waits, and stops counting however it ends', async () => {
  serverActivity.reset();
  let busyDuring = false;
  const restore = withFetch(async () => {
    busyDuring = serverActivity.busy;
    return new Response('{"fragments":[]}', { status: 200 });
  });
  try {
    await new MateuApiClient('http://x', 's').runAction(rq('save'));
    assert.equal(busyDuring, true);
    assert.equal(serverActivity.inFlight, 0);
  } finally {
    restore();
  }
  const failing = withFetch(async () => new Response('boom', { status: 500 }));
  try {
    await assert.rejects(new MateuApiClient('http://x', 's').runAction(rq('save')), /HTTP 500/);
    assert.equal(serverActivity.inFlight, 0, 'a failure is uncounted too');
  } finally {
    failing();
  }
});

test('background traffic is never counted: presence, the flagged polling refresh', async () => {
  serverActivity.reset();
  const seen: boolean[] = [];
  const restore = withFetch(async () => {
    seen.push(serverActivity.busy);
    return new Response('{"fragments":[]}', { status: 200 });
  });
  try {
    const api = new MateuApiClient('http://x', 's');
    await api.runAction(rq('_presence'));
    await api.runAction(rq('refresh', { background: true }));
    assert.deepEqual(seen, [false, false]);
  } finally {
    restore();
  }
});

test('a LongTask stream counts while open; the app event stream does not', async () => {
  serverActivity.reset();
  const seen: boolean[] = [];
  const restore = withFetch(async () => {
    seen.push(serverActivity.busy);
    return new Response('data: {"fragments":[]}\n\n', { status: 200 });
  });
  try {
    const api = new MateuApiClient('http://x', 's');
    await api.runActionStream(rq('longTask'), () => {});
    await api.runActionStream(rq('_live-updates'), () => {});
    assert.deepEqual(seen, [true, false]);
    assert.equal(serverActivity.inFlight, 0);
  } finally {
    restore();
  }
});

test('a direct REST source counts until its body is read', async () => {
  serverActivity.reset();
  let busyDuring = false;
  const restore = withFetch(async () => {
    busyDuring = serverActivity.busy;
    return new Response('{"items":[]}', { status: 200 });
  });
  try {
    assert.deepEqual(await fetchExternalJson({ url: 'https://api.example/x' }, (t) => String(t ?? '')), { items: [] });
    assert.equal(busyDuring, true);
    assert.equal(serverActivity.inFlight, 0);
  } finally {
    restore();
  }
});
