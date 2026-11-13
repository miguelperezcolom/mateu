import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';

// A STREAMED action (an `sse` LongTask) behind a static bundle follows the same hybrid rule as
// runAction: a load is answered by the bundle, an action goes on to the server's /mateu/v3/sse
// endpoint, and only a host with no server behind it ends in "This UI has no server".

const local = {
  answer: (rq: { actionId: string }) => {
    if (rq.actionId) throw new Error(`This UI has no server: "${rq.actionId}" cannot run here.`);
    return { fromBundle: true };
  },
};

const encoder = new TextEncoder();

/** A response whose body is a stream the test feeds chunk by chunk. */
const streamingResponse = () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({ start: (c) => { controller = c; } });
  return {
    response: { ok: true, status: 200, body, text: async () => '', headers: { get: () => null } },
    push: (text: string) => controller.enqueue(encoder.encode(text)),
    end: () => controller.close(),
    fail: (e: unknown) => controller.error(e),
  };
};

const withFetch = async (answer: (url: string, init: any) => Promise<any>, run: (seen: string[]) => Promise<void>) => {
  const real = globalThis.fetch;
  const seen: string[] = [];
  globalThis.fetch = (async (url: string, init: any) => {
    seen.push(String(url));
    return answer(String(url), init);
  }) as any;
  try { await run(seen); } finally { globalThis.fetch = real; }
};

const sse = (increment: unknown) => `data:${JSON.stringify(increment)}\n\n`;
const tick = () => new Promise((r) => setTimeout(r, 5));

test('a streamed action reaches the server behind a hybrid bundle, increments delivered as they arrive', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  const stream = streamingResponse();
  await withFetch(async () => stream.response, async (seen) => {
    const got: unknown[] = [];
    const done = api.runActionStream({ route: '/people', actionId: 'import' } as any, (i) => got.push(i));
    await tick();
    assert.deepEqual(seen, ['https://ui.example/mateu/v3/sse/people']);
    stream.push(sse({ step: 1 }));
    await tick();
    assert.deepEqual(got, [{ step: 1 }], 'the first increment arrives before the stream ends');
    stream.push(sse({ step: 2 }));
    stream.end();
    await done;
    assert.deepEqual(got, [{ step: 1 }, { step: 2 }]);
  });
});

test('a streamed action behind a hybrid bundle can be cancelled', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  const stream = streamingResponse();
  const abort = new AbortController();
  await withFetch(async (_url, init) => {
    init.signal?.addEventListener('abort', () => stream.fail(new DOMException('aborted', 'AbortError')));
    return stream.response;
  }, async () => {
    const got: unknown[] = [];
    const done = api.runActionStream({ route: '/people', actionId: 'import' } as any, (i) => got.push(i), abort.signal);
    await tick();
    stream.push(sse({ step: 1 }));
    await tick();
    abort.abort();
    await assert.rejects(done, (e: any) => e?.name === 'AbortError' && !/no server/.test(String(e?.message)));
    assert.deepEqual(got, [{ step: 1 }]);
  });
});

test('a load through the stream is still answered by the bundle, with no request', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(async () => { throw new Error('no request expected'); }, async (seen) => {
    const got: unknown[] = [];
    await api.runActionStream({ route: '/people', actionId: '' } as any, (i) => got.push(i));
    assert.deepEqual(got, [{ fromBundle: true }]);
    assert.deepEqual(seen, []);
  });
});

for (const [what, answer] of [
  ['404', async () => ({ ok: false, status: 404, text: async () => 'Not found', headers: { get: () => null } })],
  ['405', async () => ({ ok: false, status: 405, text: async () => 'Method not allowed', headers: { get: () => null } })],
  ['no answer', async () => { throw new TypeError('Network request failed'); }],
] as const) {
  test(`a purely static host (${what}) tells a streamed action there is no server — and does not hang`, async () => {
    const api = new MateuApiClient('https://ui.example', 's');
    api.local = local;
    await withFetch(answer as any, async (seen) => {
      await assert.rejects(api.runActionStream({ route: '/people', actionId: 'import' } as any, () => {}), /This UI has no server/);
      assert.deepEqual(seen, ['https://ui.example/mateu/v3/sse/people']);
    });
  });
}

test('a server error on a streamed action is reported as such, not as "no server"', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(async () => ({ ok: false, status: 500, text: async () => 'boom', headers: { get: () => null } }), async () => {
    await assert.rejects(api.runActionStream({ route: '/people', actionId: 'import' } as any, () => {}), /HTTP 500/);
  });
});
