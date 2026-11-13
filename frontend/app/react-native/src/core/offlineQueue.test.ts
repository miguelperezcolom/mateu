import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHUNK_CHARS,
  MAX_QUEUED_ITEMS,
  OfflineQueue,
  generations,
  newIdempotencyKey,
  outboxIndexKeyOf,
  outboxKeyOf,
  refusalOf,
  retryDelayAfter,
  shouldQueue,
  type QueuedRequest,
} from './offlineQueue.ts';
import { HttpStatusError, RequestTimeoutError } from './requestPolicy.ts';
import type { KeyValueStore } from './sessionId.ts';

const memory = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
};

const request = (actionId = 'save', state: Record<string, unknown> = { counted: 3 }): QueuedRequest => ({
  route: '/count', consumedRoute: '', actionId, serverSideType: 'acme.Count', initiatorComponentId: 'c1',
  componentState: state, appState: {}, parameters: {},
});

const offline = () => Promise.reject(new TypeError('Network request failed'));

test('only an action that declared it, failing offline or by timeout, is queued', () => {
  assert.equal(shouldQueue(true, { kind: 'offline' }), true);
  assert.equal(shouldQueue(true, { kind: 'timeout' }), true);
  assert.equal(shouldQueue(true, { kind: 'server' }), false); // the server answered: not a lost request
  assert.equal(shouldQueue(true, { kind: 'forbidden' }), false);
  assert.equal(shouldQueue(undefined, { kind: 'offline' }), false);
  assert.equal(shouldQueue(false, { kind: 'timeout' }), false);
});

test('a key is a v4 uuid the servers accept (8-128 url-safe characters)', () => {
  const key = newIdempotencyKey((b) => b.fill(7));
  assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(key, /^[A-Za-z0-9_\-:.]{8,128}$/);
});

test('the store key of a UI is secure-store safe, and one per owner', () => {
  assert.match(outboxKeyOf('https://x/y z'), /^mateu\.ui\.https___x_y_z\.outbox\.[0-9a-f]{16}$/);
  assert.match(outboxKeyOf('https://x/y z', 'someone'), /^[A-Za-z0-9._-]+$/);
  assert.notEqual(outboxKeyOf('ui', 'alice'), outboxKeyOf('ui', 'bob'));
});

test('a long value is split into chunks under the secure-store limit and read back whole', async () => {
  const store = memory();
  const value = 'x'.repeat(CHUNK_CHARS * 2 + 10);
  await generations.write(store, 'k', value);
  for (const [, v] of store.data) assert.ok(v.length <= CHUNK_CHARS);
  assert.equal([...store.data.keys()].filter((k) => k !== 'k').length, 3);
  assert.deepEqual(await generations.read(store, 'k'), { kind: 'ok', value, recovered: false });
  await generations.write(store, 'k', 'short');
  assert.deepEqual(await generations.read(store, 'k'), { kind: 'ok', value: 'short', recovered: false });
  await generations.write(store, 'k', 'shorter');
  // the current version and the one before it are kept, older ones go
  assert.equal([...store.data.keys()].filter((k) => k !== 'k').length, 2);
  await generations.remove(store, 'k');
  assert.equal(store.data.size, 0);
  assert.deepEqual(await generations.read(store, 'k'), { kind: 'empty' });
});

test('a queued item survives a restart and carries no credentials', async () => {
  const store = memory();
  const q = new OfflineQueue(store, 'ui1');
  const withHeaders = { ...request(), headers: { Authorization: 'Bearer secret' } } as unknown as QueuedRequest;
  assert.equal(await q.enqueue(withHeaders, 'key-0001-aaaa', 'Count · Save', 1000), true);
  assert.equal(await q.enqueue(request(), 'key-0001-aaaa', 'again'), true); // same key: once
  const again = await new OfflineQueue(store, 'ui1').list();
  assert.equal(again.length, 1);
  assert.equal(again[0].key, 'key-0001-aaaa');
  assert.equal(again[0].state, 'pending');
  assert.equal(again[0].createdAt, 1000);
  assert.ok(![...store.data.values()].join('').includes('secret'));
  assert.equal(await OfflineQueue.countOf(store, 'ui1'), 1);
  assert.equal(await OfflineQueue.countOf(store, 'ui2'), 0);
});

test('the queue is bounded', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  for (let i = 0; i < MAX_QUEUED_ITEMS; i++) assert.equal(await q.enqueue(request(), `key-${i}-xxxxxx`, 'x'), true);
  assert.equal(await q.enqueue(request(), 'key-over-xxxxxx', 'x'), false);
  assert.equal(await new OfflineQueue(memory(), 'u').enqueue(request('save', { photo: 'p'.repeat(70 * 1024) }), 'key-big-xxxxx', 'x'), false);
});

test('draining sends in order, one at a time, each with its own key, and empties the queue', async () => {
  const store = memory();
  const q = new OfflineQueue(store, 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  await q.enqueue(request('b'), 'key-b-000002', 'B');
  const calls: string[] = [];
  let inFlight = 0;
  const result = await q.drain(async (rq, key) => {
    inFlight++;
    assert.equal(inFlight, 1);
    calls.push(`${rq.actionId}:${key}`);
    await new Promise((r) => setTimeout(r, 5));
    inFlight--;
    return { messages: [{ variant: 'success', text: 'ok' }] };
  });
  assert.deepEqual(calls, ['a:key-a-000001', 'b:key-b-000002']);
  assert.equal(result.sent.length, 2);
  assert.equal(result.stoppedBy, undefined);
  assert.deepEqual(await q.list(), []);
  // nothing of the queue is left — only the UI's list of owners, which holds no data
  assert.deepEqual([...store.data.keys()], [outboxIndexKeyOf('ui1')]);
});

test('still offline: the head stays pending and nothing after it is sent', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  await q.enqueue(request('b'), 'key-b-000002', 'B');
  let calls = 0;
  const result = await q.drain(() => (calls++, offline()));
  assert.equal(calls, 1);
  assert.equal(result.stoppedBy?.kind, 'waiting');
  assert.equal((await q.list()).length, 2);
  // a timeout or a 5xx also waits — with the same key next time
  assert.equal((await q.drain(() => Promise.reject(new RequestTimeoutError(10)))).stoppedBy?.kind, 'waiting');
  assert.equal((await q.drain(() => Promise.reject(new HttpStatusError(503, 'busy')))).stoppedBy?.kind, 'waiting');
});

test('a refusal stops the queue, is shown, and blocks what follows until retried or cancelled', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  await q.enqueue(request('b'), 'key-b-000002', 'B');
  const sent: string[] = [];
  const refuseA = async (rq: QueuedRequest) => {
    sent.push(rq.actionId);
    return rq.actionId === 'a' ? { messages: [{ variant: 'error', title: 'Not saved', text: 'Count closed' }] } : {};
  };
  const first = await q.drain(refuseA);
  assert.equal(first.stoppedBy?.kind, 'refused');
  assert.equal(first.stoppedBy?.kind === 'refused' && first.stoppedBy.message, 'Not saved: Count closed');
  assert.deepEqual(sent, ['a']);
  const [head] = await q.list();
  assert.equal(head.state, 'refused');
  assert.equal(head.error, 'Not saved: Count closed');
  // a refused head blocks the queue (what follows may depend on it)
  assert.equal((await q.drain(refuseA)).stoppedBy?.kind, 'refused');
  assert.deepEqual(sent, ['a']);
  // cancelling it lets the rest go
  await q.cancel('key-a-000001');
  assert.equal((await q.drain(refuseA)).sent.length, 1);
  assert.deepEqual(sent, ['a', 'b']);
});

test('GA-5.6: the servers\' "Too many pending requests" is not a refusal: the item waits and goes again', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  const busy = async () => ({
    messages: [{ variant: 'error', title: 'Too many pending requests', text: 'The server is still processing too many requests. Try again in a moment.' }],
  });
  const result = await q.drain(busy);
  assert.equal(result.stoppedBy?.kind, 'waiting');
  const [head] = await q.list();
  assert.equal(head.state, 'pending');
  assert.equal(head.error, undefined);
  // the next drain sends it with the same key
  const keys: string[] = [];
  assert.equal((await q.drain(async (_rq, key) => (keys.push(key), {}))).sent.length, 1);
  assert.deepEqual(keys, ['key-a-000001']);
});

test('GA-5.6: a busy / failing server is tried again on its own after a while; no connection waits for it', () => {
  const item = { key: 'k', request: request(), label: '', createdAt: 0, state: 'pending' as const };
  const waiting = (reason: 'server' | 'timeout' | 'offline') => ({ sent: [], stoppedBy: { kind: 'waiting' as const, reason, item } });
  assert.equal(retryDelayAfter(waiting('server'), 0), 30_000);
  assert.equal(retryDelayAfter(waiting('timeout'), 1), 60_000);
  assert.equal(retryDelayAfter(waiting('server'), 20), 600_000, 'capped at 10 minutes');
  assert.equal(retryDelayAfter(waiting('offline'), 0), null);
  assert.equal(retryDelayAfter({ sent: [], stoppedBy: { kind: 'refused', message: 'x', item } }, 0), null);
  assert.equal(retryDelayAfter({ sent: [] }, 0), null);
  assert.equal(retryDelayAfter(null, 0), null);
});

test('a 4xx is a refusal; a retried refused item goes again with the same key', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  assert.equal((await q.drain(() => Promise.reject(new HttpStatusError(403, '')))).stoppedBy?.kind, 'refused');
  await q.retry('key-a-000001');
  assert.equal((await q.list())[0].state, 'pending');
  const keys: string[] = [];
  await q.drain(async (_rq, key) => (keys.push(key), {}));
  assert.deepEqual(keys, ['key-a-000001']);
});

test('an expired sign-in keeps the item and asks for a sign-in', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  const result = await q.drain(() => Promise.reject(new HttpStatusError(401, '')));
  assert.equal(result.stoppedBy?.kind, 'signInNeeded');
  assert.equal((await q.list())[0].state, 'pending');
});

test('concurrent drains share one run (connectivity back + the user pressing Send now)', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  await q.enqueue(request('a'), 'key-a-000001', 'A');
  let calls = 0;
  const send = async () => (calls++, await new Promise((r) => setTimeout(r, 5)), {});
  const [one, two] = await Promise.all([q.drain(send), q.drain(send)]);
  assert.equal(calls, 1);
  assert.equal(one, two);
});

test('the queue of a removed UI is dropped', async () => {
  const store = memory();
  await new OfflineQueue(store, 'ui1').enqueue(request(), 'key-0001-aaaa', 'x');
  await OfflineQueue.clear(store, 'ui1');
  assert.equal(store.data.size, 0);
  assert.equal(await OfflineQueue.countOf(store, 'ui1'), 0);
});

test('listeners hear every change', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  const seen: number[] = [];
  q.subscribe((items) => seen.push(items.length));
  await q.enqueue(request(), 'key-0001-aaaa', 'x');
  await q.cancel('key-0001-aaaa');
  assert.deepEqual(seen.slice(-2), [1, 0]);
});

test('refusalOf reads the error message of an answer', () => {
  assert.equal(refusalOf({ messages: [{ variant: 'info', text: 'x' }] }), null);
  assert.equal(refusalOf({ messages: [{ variant: 'error', text: 'Nope' }] }), 'Nope');
  assert.equal(refusalOf(null), null);
});

test('the hub hears any UI queue change until it unsubscribes, a removal included', async () => {
  const store = memory();
  const heard: string[] = [];
  const off = OfflineQueue.onAnyChange((uiId) => heard.push(uiId));
  await new OfflineQueue(store, 'ui1').enqueue(request(), 'key-0001-aaaa', 'x');
  await OfflineQueue.clear(store, 'ui2');
  off();
  await new OfflineQueue(store, 'ui3').enqueue(request(), 'key-0002-bbbb', 'y');
  assert.deepEqual(heard, ['ui1', 'ui2']);
});

test('a listener that unsubscribed hears nothing more; the snapshot follows the queue', async () => {
  const q = new OfflineQueue(memory(), 'ui1');
  assert.deepEqual(q.snapshot, []);
  const seen: number[] = [];
  const off = q.subscribe((items) => seen.push(items.length));
  await q.enqueue(request(), 'key-0001-aaaa', 'x');
  off();
  await q.enqueue(request(), 'key-0002-bbbb', 'y');
  assert.deepEqual(seen.slice(-1), [1]);
  assert.deepEqual(q.snapshot.map((i) => i.key), ['key-0001-aaaa', 'key-0002-bbbb']);
});

test('a full store: the request is not kept for later (false) but lives in memory for this launch', async () => {
  const store = memory();
  store.set = async () => {
    throw new Error('quota');
  };
  const q = new OfflineQueue(store, 'ui1');
  assert.equal(await q.enqueue(request(), 'key-0001-aaaa', 'x'), false);
  assert.equal(q.snapshot.length, 1);
  assert.equal(store.data.size, 0);
});

test('a corrupt outbox is DAMAGED, never empty; a locked store is unavailable; clearing a broken store still notifies', async () => {
  const corrupt = memory();
  await generations.write(corrupt, outboxKeyOf('ui1'), '{not json');
  const damaged = new OfflineQueue(corrupt, 'ui1');
  assert.deepEqual(await damaged.list(), []);
  assert.equal(damaged.status, 'damaged');
  // nothing is written over it…
  assert.equal(await damaged.enqueue(request(), 'key-0001-aaaa', 'x'), false);
  assert.equal(damaged.status, 'damaged');
  // …until the user discards it explicitly
  await damaged.discardDamaged();
  assert.equal(damaged.status, 'ok');
  assert.equal(await damaged.enqueue(request(), 'key-0001-aaaa', 'x'), true);
  const valid = memory();
  await generations.write(valid, outboxKeyOf('ui1'), JSON.stringify({ v: 1, owner: 'anonymous', items: [{ key: 'k', request: {} }, null] }));
  assert.equal(await OfflineQueue.countOf(valid, 'ui1'), 0); // items without an actionId are dropped
  const broken = memory();
  broken.get = async () => {
    throw new Error('locked');
  };
  broken.remove = async () => {
    throw new Error('locked');
  };
  const locked = new OfflineQueue(broken, 'ui1');
  assert.deepEqual(await locked.list(), []);
  assert.equal(locked.status, 'unavailable');
  assert.equal(await locked.enqueue(request(), 'key-0001-aaaa', 'x'), false);
  const heard: string[] = [];
  const off = OfflineQueue.onAnyChange((uiId) => heard.push(uiId));
  await OfflineQueue.clear(broken, 'ui1');
  off();
  assert.deepEqual(heard, ['ui1']);
});
