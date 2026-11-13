// R3 (pre-GA review): an interrupted write never leaves a mix of versions, and a queue that cannot
// be read back whole is reported — recovered from its previous copy, or DAMAGED — never as empty.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHUNK_CHARS,
  OUTBOX_RECOVERY_TEXTS,
  OfflineQueue,
  generations,
  outboxKeyOf,
  outboxRecoveryTexts,
  type QueuedRequest,
} from './offlineQueue.ts';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';
import type { KeyValueStore } from './sessionId.ts';

/** An in-memory store that can fail its Nth operation (counted from `arm`), set or remove. */
const faulty = () => {
  const data = new Map<string, string>();
  let ops = 0;
  let failAt = -1;
  let kinds: ('set' | 'remove')[] = ['set', 'remove'];
  const maybeFail = (kind: 'set' | 'remove') => {
    if (!kinds.includes(kind)) return;
    ops++;
    if (ops === failAt) throw new Error(`injected ${kind} failure at op ${ops}`);
  };
  const store: KeyValueStore = {
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => {
      maybeFail('set');
      data.set(k, v);
    },
    remove: async (k) => {
      maybeFail('remove');
      data.delete(k);
    },
  };
  return {
    store,
    data,
    /** Counts writes/removes from now on and fails the nth (none: n = -1). */
    arm(n: number, only: ('set' | 'remove')[] = ['set', 'remove']) {
      ops = 0;
      failAt = n;
      kinds = only;
    },
    get ops() {
      return ops;
    },
  };
};

const A = 'A'.repeat(CHUNK_CHARS * 2 + 7); // three chunks
const B = 'B'.repeat(CHUNK_CHARS * 3 + 1); // four chunks
const C = 'C'.repeat(CHUNK_CHARS + 3);

test('a write interrupted at ANY write or delete reads back as the whole old version or the whole new one', async () => {
  // how many store operations one replacing write takes (with an older version to collect)
  const probe = faulty();
  await generations.write(probe.store, 'k', C);
  await generations.write(probe.store, 'k', A);
  probe.arm(-1);
  await generations.write(probe.store, 'k', B);
  const total = probe.ops;
  assert.ok(total > 6, `a multi-chunk write takes several operations (${total})`);

  let sawOld = 0;
  let sawNew = 0;
  for (let n = 1; n <= total; n++) {
    const f = faulty();
    await generations.write(f.store, 'k', C);
    await generations.write(f.store, 'k', A);
    f.arm(n);
    await generations.write(f.store, 'k', B).catch(() => undefined);
    const read = await generations.read(f.store, 'k');
    assert.equal(read.kind, 'ok', `failure at op ${n}`);
    const value = read.kind === 'ok' ? read.value : '';
    assert.ok(value === A || value === B, `failure at op ${n} read a mix`);
    assert.equal(read.kind === 'ok' && read.recovered, false, `failure at op ${n}: the committed version reads whole`);
    if (value === A) sawOld++;
    else sawNew++;
    // and the next write after the failure still works and leaves no orphan chunk behind
    f.arm(-1);
    await generations.write(f.store, 'k', C);
    assert.deepEqual(await generations.read(f.store, 'k'), { kind: 'ok', value: C, recovered: false });
    await generations.write(f.store, 'k', A);
    const chunks = [...f.data.keys()].filter((k) => k !== 'k');
    assert.equal(chunks.length, Math.ceil(C.length / CHUNK_CHARS) + Math.ceil(A.length / CHUNK_CHARS), `failure at op ${n}: orphans ${chunks}`);
  }
  assert.ok(sawOld > 0 && sawNew > 0);
});

test('emptying interrupted at any delete reads back as the old version or empty', async () => {
  const probe = faulty();
  await generations.write(probe.store, 'k', A);
  await generations.write(probe.store, 'k', B);
  probe.arm(-1);
  await generations.remove(probe.store, 'k');
  const total = probe.ops;
  for (let n = 1; n <= total; n++) {
    const f = faulty();
    await generations.write(f.store, 'k', A);
    await generations.write(f.store, 'k', B);
    f.arm(n);
    await generations.remove(f.store, 'k').catch(() => undefined);
    const read = await generations.read(f.store, 'k');
    assert.ok(read.kind === 'empty' || (read.kind === 'ok' && read.value === B), `failure at op ${n}: ${JSON.stringify(read).slice(0, 80)}`);
  }
});

const request = (n: number): QueuedRequest => ({
  route: '/stock', consumedRoute: '', actionId: 'save', serverSideType: 'acme.Stock', initiatorComponentId: 'c1',
  componentState: { n, note: 'x'.repeat(900) }, appState: {}, parameters: {},
});

test('the queue survives a save interrupted at any operation: the old items or the new ones, never a mix or nothing', async () => {
  const probe = faulty();
  const p = new OfflineQueue(probe.store, 'ui1');
  for (let i = 0; i < 3; i++) await p.enqueue(request(i), `key-${i}-000000`, `#${i}`);
  probe.arm(-1);
  await p.enqueue(request(3), 'key-3-000000', '#3');
  const total = probe.ops;
  for (let n = 1; n <= total; n++) {
    const f = faulty();
    const q = new OfflineQueue(f.store, 'ui1');
    for (let i = 0; i < 3; i++) await q.enqueue(request(i), `key-${i}-000000`, `#${i}`);
    f.arm(n);
    await q.enqueue(request(3), 'key-3-000000', '#3');
    const reread = new OfflineQueue(f.store, 'ui1');
    const keys = (await reread.list()).map((i) => i.key);
    assert.equal(reread.status, 'ok', `failure at op ${n}`);
    assert.ok(
      JSON.stringify(keys) === JSON.stringify(['key-0-000000', 'key-1-000000', 'key-2-000000'])
        || JSON.stringify(keys) === JSON.stringify(['key-0-000000', 'key-1-000000', 'key-2-000000', 'key-3-000000']),
      `failure at op ${n}: ${keys}`,
    );
  }
});

test('garbage in the current version falls back to the previous one (recovered), and it is written back', async () => {
  const f = faulty();
  const q = new OfflineQueue(f.store, 'ui1');
  await q.enqueue(request(1), 'key-1-000000', '#1');
  await q.enqueue(request(2), 'key-2-000000', '#2');
  // scribble over one chunk of the current version
  const pointer = JSON.parse(f.data.get(outboxKeyOf('ui1'))!) as { cur: { g: string } };
  f.data.set(`${outboxKeyOf('ui1')}.${pointer.cur.g}.0`, 'garbage');
  const reread = new OfflineQueue(f.store, 'ui1');
  assert.deepEqual((await reread.list()).map((i) => i.key), ['key-1-000000']);
  assert.equal(reread.status, 'recovered');
  await new Promise((r) => setTimeout(r, 10));
  // the recovered copy is the current one now
  const third = new OfflineQueue(f.store, 'ui1');
  assert.deepEqual((await third.list()).map((i) => i.key), ['key-1-000000']);
  assert.equal(third.status, 'ok');
  reread.acknowledgeRecovery();
  assert.equal(reread.status, 'ok');
});

test('no readable version at all → DAMAGED, never an empty queue', async () => {
  for (const scribble of ['chunk', 'pointer', 'missing'] as const) {
    const f = faulty();
    const q = new OfflineQueue(f.store, 'ui1');
    await q.enqueue(request(1), 'key-1-000000', '#1'); // one version only: no previous to fall back to
    const key = outboxKeyOf('ui1');
    const pointer = JSON.parse(f.data.get(key)!) as { cur: { g: string } };
    if (scribble === 'chunk') f.data.set(`${key}.${pointer.cur.g}.0`, '{"v":1,"owner":"anonymous","items":[]}');
    if (scribble === 'pointer') f.data.set(key, '{"half');
    if (scribble === 'missing') f.data.delete(`${key}.${pointer.cur.g}.0`);
    const reread = new OfflineQueue(f.store, 'ui1');
    assert.deepEqual(await reread.list(), [], scribble);
    assert.equal(reread.status, 'damaged', scribble);
    assert.equal(await OfflineQueue.countOf(f.store, 'ui1'), 0);
    // the damaged copy stays until the user discards it
    assert.equal(await reread.enqueue(request(2), 'key-2-000000', '#2'), false);
    assert.ok(f.data.has(key), scribble);
    await reread.discardDamaged();
    // every version the pointer names goes (an unreadable pointer names none: only it can go)
    if (scribble === 'pointer') assert.equal(f.data.has(key), false);
    else assert.equal([...f.data.keys()].filter((k) => k.startsWith(key)).length, 0, scribble);
    assert.equal(await reread.enqueue(request(2), 'key-2-000000', '#2'), true, scribble);
  }
});

test('concurrent saves are serialized: no lost update', async () => {
  // a slow store: every write takes a while, so unserialized saves would overlap
  const data = new Map<string, string>();
  const slow: KeyValueStore = {
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      data.set(k, v);
    },
    remove: async (k) => {
      await new Promise((r) => setTimeout(r, Math.random() * 3));
      data.delete(k);
    },
  };
  const q = new OfflineQueue(slow, 'ui1');
  await Promise.all([0, 1, 2, 3, 4].map((i) => q.enqueue(request(i), `key-${i}-000000`, `#${i}`)));
  await q.cancel('key-2-000000');
  const reread = new OfflineQueue(slow, 'ui1');
  assert.deepEqual((await reread.list()).map((i) => i.key).sort(), ['key-0-000000', 'key-1-000000', 'key-3-000000', 'key-4-000000']);
  assert.equal(reread.status, 'ok');
  // raw generational writes on one key land in call order, each whole
  await Promise.all(['one', 'two', 'three'].map((v) => generations.write(slow, 'raw', v.repeat(1000))));
  assert.deepEqual(await generations.read(slow, 'raw'), { kind: 'ok', value: 'three'.repeat(1000), recovered: false });
});

test('the recovery words exist in every chrome language', () => {
  for (const lang of CHROME_LANGUAGES) {
    const words = OUTBOX_RECOVERY_TEXTS[lang];
    for (const key of Object.keys(OUTBOX_RECOVERY_TEXTS.en) as (keyof typeof words)[]) {
      assert.ok(typeof words[key] === 'string' && words[key].length > 0, `${lang}.${key}`);
    }
  }
  assert.equal(outboxRecoveryTexts('es-ES').discard, 'Descartarlos');
  assert.equal(outboxRecoveryTexts('ja').discard, OUTBOX_RECOVERY_TEXTS.en.discard);
});
