import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient, setStreamingFetch } from './MateuApiClient.ts';

// A LongTask answers on the SSE endpoint with one increment per step: each has to reach the
// screen as it arrives (the progress dialog moves), not all together once the task is over.
test('an sse action posts to the stream endpoint and applies each increment as it arrives', async () => {
  const enc = new TextEncoder();
  const chunks = ['data: {"fragments":[{"step":1}]}\n\n', 'data: {"fragm', 'ents":[{"step":2}]}\n\n:heartbeat\n\n', 'data: {"fragments":[{"step":3}]}'];
  let seenUrl = '';
  let seenAccept = '';
  const applied: unknown[] = [];
  setStreamingFetch((async (url: string, init: { headers: Record<string, string> }) => {
    seenUrl = url;
    seenAccept = init.headers['Accept'];
    let i = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (i < chunks.length) controller.enqueue(enc.encode(chunks[i++]));
        else controller.close();
      },
    });
    return new Response(body, { status: 200 });
  }) as unknown as typeof fetch);
  try {
    const api = new MateuApiClient('http://x', 's');
    await api.runActionStream(
      { route: '/long-task', consumedRoute: '', actionId: 'runLongTask', serverSideType: 'T', initiatorComponentId: 'c', componentState: {}, appState: {}, parameters: {} },
      (inc) => applied.push(inc),
    );
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(seenUrl, 'http://x/mateu/v3/sse/long-task');
  assert.equal(seenAccept, 'text/event-stream');
  assert.deepEqual(applied, [{ fragments: [{ step: 1 }] }, { fragments: [{ step: 2 }] }, { fragments: [{ step: 3 }] }]);
});

// Session expiry on the stream (external review, 2026-10-18): runAction re-authenticates on a 401
// and retries once; a LongTask's stream failed straight away, losing the user's long-running work.
const sseParams = { route: '/long-task', consumedRoute: '', actionId: 'runLongTask', serverSideType: 'T', initiatorComponentId: 'c', componentState: {}, appState: {}, parameters: {} };
const tokenProvider = (first: string, renewed: string | null) => {
  const p = {
    token: first,
    refreshes: 0,
    getToken: async () => p.token,
    refresh: async () => {
      p.refreshes++;
      if (renewed === null) return false;
      p.token = renewed;
      return true;
    },
    login: async () => false,
  };
  return p;
};
const streamFetch = (statusFor: (auth: string | undefined, attempt: number) => number, seen: (string | undefined)[]) =>
  (async (_url: string, init: { headers: Record<string, string> }) => {
    const auth = init.headers['Authorization'];
    seen.push(auth);
    const status = statusFor(auth, seen.length);
    return new Response(status === 200 ? 'data: {"fragments":[{"step":1}]}\n\n' : 'expired', { status });
  }) as unknown as typeof fetch;

test('a 401 on the stream re-authenticates through the client\'s provider and retries ONCE with the new token', async () => {
  const seen: (string | undefined)[] = [];
  const provider = tokenProvider('OLD', 'NEW');
  setStreamingFetch(streamFetch((auth) => (auth === 'Bearer NEW' ? 200 : 401), seen));
  const applied: unknown[] = [];
  try {
    await new MateuApiClient('http://x', 's', provider).runActionStream(sseParams, (inc) => applied.push(inc));
  } finally {
    setStreamingFetch(null);
  }
  assert.deepEqual(seen, ['Bearer OLD', 'Bearer NEW']);
  assert.equal(provider.refreshes, 1);
  assert.deepEqual(applied, [{ fragments: [{ step: 1 }] }]);
});

test('a stream still 401 after the renewal fails without a second retry', async () => {
  const seen: (string | undefined)[] = [];
  const provider = tokenProvider('OLD', 'NEW');
  setStreamingFetch(streamFetch(() => 401, seen));
  try {
    await assert.rejects(new MateuApiClient('http://x', 's', provider).runActionStream(sseParams, () => {}), /HTTP 401/);
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(seen.length, 2);
});

test('a stream 401 nobody can renew fails at once', async () => {
  const seen: (string | undefined)[] = [];
  setStreamingFetch(streamFetch(() => 401, seen));
  try {
    await assert.rejects(new MateuApiClient('http://x', 's', tokenProvider('OLD', null)).runActionStream(sseParams, () => {}), /HTTP 401/);
    // an anonymous client (auth = null) is never re-authenticated either
    await assert.rejects(new MateuApiClient('http://x', 's', null).runActionStream(sseParams, () => {}), /HTTP 401/);
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(seen.length, 2);
});

// The live-push channel is open-ended: it must be closable (the app goes to the background), so the
// abort signal reaches the fetch and ends the read.
test('a stream can be aborted: the signal reaches the fetch', async () => {
  let seenSignal: AbortSignal | undefined;
  setStreamingFetch((async (_url: string, init: { signal?: AbortSignal }) => {
    seenSignal = init.signal;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        init.signal?.addEventListener('abort', () => controller.error(new Error('aborted')));
      },
    });
    return new Response(body, { status: 200 });
  }) as unknown as typeof fetch);
  try {
    const api = new MateuApiClient('http://x', 's');
    const controller = new AbortController();
    const done = api.runActionStream({ ...sseParams, actionId: '_agent-channel' }, () => {}, controller.signal);
    await new Promise((r) => setImmediate(r));
    controller.abort();
    await assert.rejects(done, /aborted/);
    assert.equal(seenSignal, controller.signal);
  } finally {
    setStreamingFetch(null);
  }
});
