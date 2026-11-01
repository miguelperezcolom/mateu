import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decideLiveReload, devEventsUrlOf, followLiveReload, parseDevEvents, reconnectDelay } from './liveReload.ts';

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/live-reload.json', import.meta.url)), 'utf8',
)) as { cases: { name: string; message: unknown; known: string | null; expect: { action: string; bootId: string | null } }[] };

for (const c of corpus.cases) {
  test(`live reload conformance: ${c.name}`, () => {
    const d = decideLiveReload(c.message as never, c.known ?? undefined);
    assert.deepEqual({ action: d.action, bootId: d.bootId ?? null }, c.expect);
  });
}

test('the dev event stream is where the manifest says, at the server root; none outside dev mode', () => {
  assert.equal(devEventsUrlOf('http://localhost:8080/app', { devEvents: '/mateu/dev/events' }), 'http://localhost:8080/mateu/dev/events');
  assert.equal(devEventsUrlOf('http://localhost:8080', {}), undefined);
  assert.equal(devEventsUrlOf('http://localhost:8080', { devEvents: 'https://evil.example/x' }), undefined);
  assert.equal(devEventsUrlOf('http://localhost:8080', { devEvents: '//evil.example/x' }), undefined);
  assert.equal(devEventsUrlOf('not a url', { devEvents: '/mateu/dev/events' }), undefined);
  assert.equal(devEventsUrlOf('http://localhost:8080', null), undefined);
});

test('SSE text splits into its events; an unfinished event waits; garbage is skipped', () => {
  const r = parseDevEvents('data: {"type":"hello","bootId":"a"}\n\ndata: nope\n\n: comment\n\ndata: {"type":"rel');
  assert.deepEqual(r.messages, [{ type: 'hello', bootId: 'a' }]);
  assert.equal(r.rest, 'data: {"type":"rel');
  assert.deepEqual(parseDevEvents('data: {"type":"ping"}\r\n\r\n').messages, [{ type: 'ping' }]);
});

test('reconnects back off from 1 s to 30 s', () => {
  assert.deepEqual([1, 2, 3, 6, 10].map(reconnectDelay), [1000, 2000, 4000, 30000, 30000]);
});

const streamOf = (chunks: string[]) => new ReadableStream<Uint8Array>({
  start(c) { for (const s of chunks) c.enqueue(new TextEncoder().encode(s)); c.close(); },
});

test('a YAML edit and an IDE reload re-render; a restarted server too; pings and the first hello do not', async () => {
  const timers: (() => void)[] = [];
  const actions: string[] = [];
  const streams = [
    ['data: {"type":"hello","bootId":"a"}\n\n', 'data: {"type":"ping"}\n\n', 'data: {"type":"specs-changed","scope":"page","files":["home.yaml"]}\n\n'],
    ['data: {"type":"hello","bootId":"b"}\n\n'],
  ];
  const urls: string[] = [];
  const fetchImpl = (async (url: string) => {
    urls.push(url);
    const chunks = streams.shift();
    return chunks ? new Response(streamOf(chunks), { status: 200 }) : new Promise(() => {});
  }) as unknown as typeof fetch;
  const stop = followLiveReload({
    url: 'http://localhost:8080/mateu/dev/events', fetchImpl, onAction: (a) => actions.push(a),
    schedule: (fn) => { timers.push(fn); return timers.length; }, cancel: () => {},
  });
  const drain = async () => { for (let i = 0; i < 20; i++) { await new Promise((r) => setImmediate(r)); while (timers.length) timers.shift()!(); } };
  await drain();
  stop();
  assert.deepEqual(actions, ['page', 'page'], 'the spec change, then the restart (new boot id)');
  assert.ok(urls.length >= 2 && urls.every((u) => u === 'http://localhost:8080/mateu/dev/events'));
});

test('a burst collapses into one re-render, the strongest wins; a failing stream retries', async () => {
  const timers: (() => void)[] = [];
  const actions: string[] = [];
  let calls = 0;
  const fetchImpl = (async () => {
    calls++;
    if (calls === 1) return new Response('nope', { status: 503 });
    if (calls === 2) return new Response(streamOf(['data: {"type":"reload","scope":"page"}\n\ndata: {"type":"specs-changed","scope":"app"}\n\n']), { status: 200 });
    return new Promise(() => {});
  }) as unknown as typeof fetch;
  const stop = followLiveReload({
    url: 'http://x/mateu/dev/events', fetchImpl, onAction: (a) => actions.push(a),
    schedule: (fn) => { timers.push(fn); return timers.length; }, cancel: () => {},
  });
  for (let i = 0; i < 20; i++) { await new Promise((r) => setImmediate(r)); while (timers.length) timers.shift()!(); }
  stop();
  assert.ok(calls >= 2, 'retried after the 503');
  assert.deepEqual(actions, ['app']);
});

test('the fetch is called detached (a browser fetch called as a method throws Illegal invocation)', async () => {
  let self: unknown = 'unset';
  const fetchImpl = function (this: unknown) { self = this; return new Promise(() => {}); } as unknown as typeof fetch;
  const stop = followLiveReload({ url: 'http://x/e', fetchImpl, onAction: () => {} });
  await new Promise((r) => setImmediate(r));
  stop();
  assert.equal(self, undefined);
});

test('stopping aborts the stream and nothing fires afterwards', async () => {
  let aborted = false;
  const fetchImpl = ((_u: string, init: RequestInit) => new Promise((_r, reject) => {
    init.signal?.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); });
  })) as unknown as typeof fetch;
  const actions: string[] = [];
  const stop = followLiveReload({ url: 'http://x/e', fetchImpl, onAction: (a) => actions.push(a) });
  stop();
  await new Promise((r) => setImmediate(r));
  assert.equal(aborted, true);
  assert.deepEqual(actions, []);
});
