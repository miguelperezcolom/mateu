import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';
import { serverActivity } from '../core/serverActivity.ts';
import { fetchExternalJson } from '../core/restFetch.ts';
import { MateuSession, islandSession } from '../core/MateuSession.ts';

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

test('GA-5.7: each hub UI waits on its OWN server: a hidden UI\'s long task never shows on the visible one', async () => {
  serverActivity.reset();
  let release: () => void = () => {};
  const restore = withFetch(async (url) => {
    if (url.includes('/sse/')) {
      await new Promise<void>((r) => (release = r));
      return new Response('data: {"fragments":[]}\n\n', { status: 200 });
    }
    return new Response('{"items":[]}', { status: 200 });
  });
  try {
    const a = new MateuSession('https://a.example', 'sa', {}, null);
    const b = new MateuSession('https://b.example', 'sb', {}, null);
    assert.notEqual(a.activity, b.activity);
    const task = a.api.runActionStream(rq('longTask'), () => {});
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(a.activity.busy, true, "A's bar waits for its long task");
    assert.equal(b.activity.busy, false, "B's bar does not");
    assert.equal(serverActivity.busy, false, 'nothing process-wide');
    // an island of A (another backend) waits on A's bar, and A's REST sources too
    const island = islandSession(a, 'https://inbox.example');
    assert.equal(island.activity, a.activity);
    assert.equal(a.sources.activity, a.activity);
    release();
    await task;
    assert.equal(a.activity.busy, false);
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
