// The offline send queue (outbox) of one UI — @Experimental, 3.0 GA. Pure TypeScript, tested by
// node's runner (offlineQueue.test.ts).
//
// An action that DECLARES it may wait (`@Action(offline = QUEUE)` → wire `ActionDto.offline:
// "queue"`) and fails because the backend cannot be reached (offline) or did not answer in time is
// kept here instead of being lost: the form's state, the action, the route and an idempotency key.
// It is sent again — in order, one at a time — when the connection is back, always with the SAME
// `Idempotency-Key` the first attempt carried, so a request the server did process before the
// answer was lost is not applied twice (the servers remember a key per caller + action and answer
// a repeat with the first answer). A refusal (an error answer, a 4xx) stops the queue and stays at
// its head, shown, until the user retries or cancels it: what follows it may depend on it.
//
// Never stored: tokens or headers — only the request body. Persisted per UI AND per OWNER (the
// signed-in identity, outboxOwner.ts — a queue is only ever loaded, counted and sent for its owner;
// another user's session never sees it) through a `KeyValueStore` (the platform keychain / keystore
// on devices: expo-secure-store, which encrypts at rest), in chunks because a secure-store value is
// limited to ~2 KB, written generationally (`generations`): an interrupted write leaves the previous
// version, and a version that does not read back whole is reported DAMAGED — never as an empty queue.
import { classifyFailure, type FailureKind } from './requestPolicy.ts';
import type { KeyValueStore } from './sessionId.ts';
import { randomUuid } from './sessionId.ts';
import { asArray } from './viewWire.ts';
import { ANONYMOUS_OWNER, digest } from './outboxOwner.ts';
import { chromeLanguageOf, type ChromeLanguage } from './chromeLanguage.ts';

export { ANONYMOUS_OWNER } from './outboxOwner.ts';

type Json = Record<string, unknown>;

/** The request a queued item sends again — exactly the body of the first attempt. */
export interface QueuedRequest {
  route: string;
  consumedRoute: string;
  actionId: string;
  serverSideType: string | null;
  initiatorComponentId: string;
  componentState: Json;
  appState: Json;
  parameters: Json;
  embeddedChrome?: string;
  timeoutMillis?: number;
}

export type QueuedState = 'pending' | 'refused';

export interface QueuedItem {
  /** The idempotency key — also the item's id. */
  key: string;
  request: QueuedRequest;
  /** What the user sees in the list: the screen and the action ("Stock count · Save"). */
  label: string;
  /** Epoch ms. */
  createdAt: number;
  state: QueuedState;
  /** Why the server refused it (state = refused). */
  error?: string;
}

/** The request header carrying the key (the IETF httpapi draft's name; honoured by the three servers). */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** Items kept per UI: past this, a new write fails as before rather than pile up unseen. */
export const MAX_QUEUED_ITEMS = 50;
/** A queued body larger than this is not kept (a form with a photo would not fit the store). */
export const MAX_ITEM_CHARS = 64 * 1024;
/** A secure-store value is limited to ~2048 bytes: longer values are split. */
export const CHUNK_CHARS = 1800;

/** Whether a failed action goes to the queue: it declared `offline: "queue"` and the failure means
 *  the request may never have reached the server, or its answer was lost. */
export function shouldQueue(declared: boolean | undefined, failure: { kind: FailureKind }): boolean {
  return declared === true && (failure.kind === 'offline' || failure.kind === 'timeout');
}

/** A fresh idempotency key (an RFC 4122 v4 UUID from the secure random source). */
export function newIdempotencyKey(random?: (bytes: Uint8Array) => Uint8Array): string {
  return random ? randomUuid(random) : randomUuid();
}

/** Store-key-safe form of a UI id (secure-store keys allow only [A-Za-z0-9._-]). */
const safeUi = (uiId: string): string => uiId.replace(/[^A-Za-z0-9._-]/g, '_');

/** The store key of the queue of `owner` on a UI: its generation POINTER (the chunks hang below it).
 *  The owner is named by a digest — the full owner is stored inside and compared on every read. */
export function outboxKeyOf(uiId: string, owner: string = ANONYMOUS_OWNER): string {
  return `mateu.ui.${safeUi(uiId)}.outbox.${digest(owner)}`;
}

/** Where a UI lists the owners that have (had) a queue on it — what removing the UI drops. */
export function outboxIndexKeyOf(uiId: string): string {
  return `mateu.ui.${safeUi(uiId)}.outboxes`;
}

/** The pre-owner layout (`…outbox.n` + `…outbox.<i>`): nobody can be matched against it, so it is
 *  never read — only dropped. */
const legacyKeyOf = (uiId: string): string => `mateu.ui.${safeUi(uiId)}.outbox`;

/** One written version of a value: its id, its chunks, and what it must read back as. */
interface Generation {
  g: string;
  n: number;
  len: number;
  sum: string;
}

/** The ONE value switched to commit a write (a single store write is atomic). `prev` is the version
 *  before — the fallback when `cur` does not read back whole; `pending` a write under way (or
 *  interrupted) and `stale` versions whose chunks are still to be deleted. */
interface Pointer {
  v: 1;
  cur: Generation | null;
  prev?: Generation;
  pending?: { g: string; n: number };
  stale?: { g: string; n: number }[];
}

/** What reading a value found: nothing, the value (`recovered` = the previous version, because the
 *  last one did not read back whole), or DAMAGED — something is stored and no version of it is
 *  readable. Damaged is never reported as empty. */
export type GenerationRead =
  | { kind: 'empty' }
  | { kind: 'ok'; value: string; recovered: boolean }
  | { kind: 'damaged' };

const chunkKey = (key: string, g: string, i: number): string => `${key}.${g}.${i}`;

let generationCounter = 0;
const newGenerationId = (): string =>
  `${Date.now().toString(36)}${(generationCounter++ % 1296).toString(36).padStart(2, '0')}${Math.floor(Math.random() * 1296).toString(36).padStart(2, '0')}`;

/** Writes on one key go one after another (two overlapping writes would race on the pointer). */
const locks = new Map<string, Promise<unknown>>();
function serialized<T>(key: string, work: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  const run = previous.then(work, work);
  const tail = run.catch(() => undefined);
  locks.set(key, tail);
  void tail.then(() => {
    if (locks.get(key) === tail) locks.delete(key);
  });
  return run;
}

function parsePointer(raw: string): Pointer | null {
  try {
    const p = JSON.parse(raw) as Pointer;
    return p && p.v === 1 && (p.cur === null || typeof p.cur?.g === 'string') ? p : null;
  } catch {
    return null;
  }
}

/**
 * A value kept in chunks (a secure-store value is limited to ~2 KB) and written GENERATIONALLY: a
 * new version goes under a new generation id, every chunk of it, then ONE pointer write switches to
 * it, and only then the version before the previous one is deleted. An interrupted write leaves the
 * old version readable; a version that does not read back whole (a chunk missing, its length or its
 * checksum wrong, or content `accept` rejects) falls back to the previous one; neither readable →
 * damaged, never empty. Writes on a key are serialized.
 */
export const generations = {
  async read(store: KeyValueStore, key: string, accept: (value: string) => boolean = () => true): Promise<GenerationRead> {
    const raw = await store.get(key); // a store that cannot be read throws: not the same as damaged
    if (raw === null) return { kind: 'empty' };
    const pointer = parsePointer(raw);
    if (!pointer) return { kind: 'damaged' };
    if (pointer.cur === null) return { kind: 'empty' };
    const cur = await readGeneration(store, key, pointer.cur, accept);
    if (cur !== null) return { kind: 'ok', value: cur, recovered: false };
    const prev = pointer.prev ? await readGeneration(store, key, pointer.prev, accept) : null;
    return prev !== null ? { kind: 'ok', value: prev, recovered: true } : { kind: 'damaged' };
  },

  /** Writes a new version (throws when it could not be committed — the old one is then intact).
   *  `content` may be a function, read when the write RUNS (after any write queued before it). */
  write(store: KeyValueStore, key: string, content: string | (() => string)): Promise<void> {
    return serialized(key, async () => {
      const value = typeof content === 'function' ? content() : content;
      const pointer = await currentPointer(store, key);
      const parts: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_CHARS) parts.push(value.slice(i, i + CHUNK_CHARS));
      if (parts.length === 0) parts.push('');
      const next: Generation = { g: newGenerationId(), n: parts.length, len: value.length, sum: digest(value) };
      const leftovers = [...(pointer.stale ?? []), ...(pointer.pending ? [pointer.pending] : [])];
      // 1. say what is being written (so an interrupted write is cleaned up by the next one)
      await store.set(key, JSON.stringify({ ...pointer, pending: { g: next.g, n: next.n }, stale: leftovers } satisfies Pointer));
      // 2. the new version, every chunk
      for (let i = 0; i < parts.length; i++) await store.set(chunkKey(key, next.g, i), parts[i]);
      // 3. the switch — one write
      const committed: Pointer = { v: 1, cur: next, stale: [...leftovers, ...(pointer.prev ? [pointer.prev] : [])] };
      if (pointer.cur) committed.prev = pointer.cur;
      await store.set(key, JSON.stringify(committed));
      // 4. only now, what is no longer needed
      await collect(store, key, committed);
    });
  },

  /** Empties the value: a pointer to nothing is committed first, then every version is deleted. */
  remove(store: KeyValueStore, key: string): Promise<void> {
    return serialized(key, async () => {
      const raw = await store.get(key);
      if (raw === null) return;
      const pointer = parsePointer(raw);
      const all = pointer
        ? [pointer.cur, pointer.prev, pointer.pending, ...(pointer.stale ?? [])].filter((x): x is { g: string; n: number } => !!x)
        : [];
      const emptied: Pointer = { v: 1, cur: null, stale: all };
      await store.set(key, JSON.stringify(emptied));
      if (await collect(store, key, emptied)) await store.remove(key).catch(() => undefined);
    });
  },

  /** Drops whatever is stored under `key`, damaged or not (the user discarded it): every version the
   *  pointer names, then the pointer. */
  discard(store: KeyValueStore, key: string): Promise<void> {
    return serialized(key, async () => {
      const raw = await store.get(key).catch(() => null);
      const pointer = raw === null ? null : parsePointer(raw);
      if (pointer) {
        for (const gen of [pointer.cur, pointer.prev, pointer.pending, ...(pointer.stale ?? [])]) {
          if (!gen) continue;
          for (let i = 0; i < gen.n; i++) await store.remove(chunkKey(key, gen.g, i));
        }
      }
      await store.remove(key);
    });
  },
};

async function currentPointer(store: KeyValueStore, key: string): Promise<Pointer> {
  const raw = await store.get(key);
  return (raw === null ? null : parsePointer(raw)) ?? { v: 1, cur: null };
}

async function readGeneration(store: KeyValueStore, key: string, gen: Generation, accept: (value: string) => boolean): Promise<string | null> {
  if (!Number.isInteger(gen.n) || gen.n <= 0) return null;
  let text = '';
  for (let i = 0; i < gen.n; i++) {
    const part = await store.get(chunkKey(key, gen.g, i));
    if (part === null) return null;
    text += part;
  }
  if (text.length !== gen.len || digest(text) !== gen.sum) return null;
  try {
    return accept(text) ? text : null;
  } catch {
    return null;
  }
}

/** Deletes the stale versions a committed pointer lists, then rewrites it without them. Best effort:
 *  the value is already committed — what could not be deleted stays listed for the next write. True
 *  when everything went. */
async function collect(store: KeyValueStore, key: string, pointer: Pointer): Promise<boolean> {
  const left: { g: string; n: number }[] = [];
  for (const gen of pointer.stale ?? []) {
    try {
      for (let i = 0; i < gen.n; i++) await store.remove(chunkKey(key, gen.g, i));
    } catch {
      left.push(gen);
    }
  }
  if (!pointer.stale?.length) return true;
  try {
    const tidy: Pointer = { v: 1, cur: pointer.cur };
    if (pointer.prev) tidy.prev = pointer.prev;
    if (left.length) tidy.stale = left;
    await store.set(key, JSON.stringify(tidy));
  } catch {
    return false;
  }
  return left.length === 0;
}

/** How sending one item went. `notOwner`: whoever is signed in now is not the queue's owner — it
 *  is not sent (it waits, suspended, for its owner). */
export type SendOutcome =
  | { kind: 'sent'; increment: unknown }
  | { kind: 'refused'; message: string }
  | { kind: 'waiting'; reason: FailureKind }
  | { kind: 'signInNeeded' }
  | { kind: 'notOwner' };

/** What a drain did: how many went, and why it stopped (if it did before the end). */
export interface DrainResult {
  sent: QueuedItem[];
  stoppedBy?: SendOutcome & { item: QueuedItem };
}

/** Sends one queued request with its key; throws like MateuApiClient.runAction. */
export type Sender = (request: QueuedRequest, idempotencyKey: string) => Promise<unknown>;

/** Who is signed in NOW (the owner a queue is compared with before each send). */
export type CurrentOwner = () => string | null | Promise<string | null>;

/** The text of an error answer (the server's error boundary / a refusal), or null. */
export function refusalOf(increment: unknown): string | null {
  const messages = asArray((increment as Json | null | undefined)?.['messages']);
  const error = messages.find((m) => (m as Json)?.['variant'] === 'error') as Json | undefined;
  if (!error) return null;
  const title = typeof error['title'] === 'string' ? error['title'] : '';
  const text = typeof error['text'] === 'string' ? error['text'] : '';
  return [title, text].filter(Boolean).join(': ') || 'The server refused it.';
}

/** Sends one item and says what happened. */
export async function sendOne(send: Sender, item: QueuedItem, online = true): Promise<SendOutcome> {
  try {
    const increment = await send(item.request, item.key);
    const refusal = refusalOf(increment);
    return refusal ? { kind: 'refused', message: refusal } : { kind: 'sent', increment };
  } catch (e) {
    const failure = classifyFailure(e, online);
    if (failure.kind === 'offline' || failure.kind === 'timeout' || failure.kind === 'server') {
      return { kind: 'waiting', reason: failure.kind };
    }
    if (failure.kind === 'unauthorized') return { kind: 'signInNeeded' };
    return { kind: 'refused', message: failure.message };
  }
}

/**
 * How the stored queue read: `ok`; `recovered` — the last write did not read back whole, the version
 * before it is shown (a change made just before may be missing or back); `damaged` — something is
 * stored and nothing of it is readable: shown as such, kept until the user discards it explicitly,
 * and no new change is added over it; `unavailable` — the store could not be read now (a locked
 * keychain): nothing is shown or written, the next use tries again.
 */
export type QueueStatus = 'ok' | 'recovered' | 'damaged' | 'unavailable';

type Listener = (items: QueuedItem[]) => void;

/** Process-wide: someone's queue changed (the hub list recounts its badges). */
const anyChange = new Set<(uiId: string) => void>();

/** What a queue keeps in its store: the owner in full (checked on every read) and the items. */
interface Stored {
  v: 1;
  owner: string;
  items: QueuedItem[];
}

/** The queue of ONE UI for ONE owner (outboxOwner.ts). */
export class OfflineQueue {
  private items: QueuedItem[] = [];
  private loaded: Promise<void> | null = null;
  private draining: Promise<DrainResult> | null = null;
  private listeners = new Set<Listener>();
  private readonly store: KeyValueStore;
  private readonly key: string;
  private readonly uiId: string;
  /** Who this queue belongs to: only sent while this owner is the one signed in. */
  readonly owner: string;
  private currentStatus: QueueStatus = 'ok';

  constructor(store: KeyValueStore, uiId: string, owner: string = ANONYMOUS_OWNER) {
    this.store = store;
    this.uiId = uiId;
    this.owner = owner;
    this.key = outboxKeyOf(uiId, owner);
  }

  /** Hears every change of any UI's queue (its id); returns the unsubscribe. */
  static onAnyChange(listener: (uiId: string) => void): () => void {
    anyChange.add(listener);
    return () => anyChange.delete(listener);
  }

  /** Tells the hub a UI's queues may read differently (someone signed in or out of it). */
  static changed(uiId: string): void {
    for (const l of [...anyChange]) l(uiId);
  }

  /** How many items `owner` has queued on a UI (the hub list's badge) — 0 for nobody (null), and
   *  never anybody else's. */
  static async countOf(store: KeyValueStore, uiId: string, owner: string | null = ANONYMOUS_OWNER): Promise<number> {
    if (owner === null) return 0;
    try {
      return (await readQueue(store, outboxKeyOf(uiId, owner), owner)).items.length;
    } catch {
      return 0;
    }
  }

  /** Drops everything a UI queued, for every owner (the UI was removed from the list). */
  static async clear(store: KeyValueStore, uiId: string): Promise<void> {
    try {
      for (const ownerDigest of await ownersOf(store, uiId)) {
        await generations.discard(store, `mateu.ui.${safeUi(uiId)}.outbox.${ownerDigest}`).catch(() => undefined);
      }
      await store.remove(outboxIndexKeyOf(uiId));
    } catch {
      // nothing to drop
    }
    await dropLegacy(store, uiId);
    for (const l of [...anyChange]) l(uiId);
  }

  /** How the stored queue read (after the first `list`/`subscribe`). */
  get status(): QueueStatus {
    return this.currentStatus;
  }

  async list(): Promise<QueuedItem[]> {
    await this.load();
    return [...this.items];
  }

  /** The items in memory (after the first `list`/`subscribe`): for a render. */
  get snapshot(): QueuedItem[] {
    return [...this.items];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    void this.load().then(() => listener([...this.items]));
    return () => this.listeners.delete(listener);
  }

  /** Keeps a request; false when it cannot be kept (the queue is full, the body too large, or the
   *  stored queue is damaged / cannot be read — nothing is written over it). */
  async enqueue(request: QueuedRequest, key: string, label: string, now = Date.now()): Promise<boolean> {
    await this.load();
    if (this.currentStatus === 'damaged' || this.currentStatus === 'unavailable') return false;
    if (this.items.some((i) => i.key === key)) return true;
    if (this.items.length >= MAX_QUEUED_ITEMS) return false;
    const item: QueuedItem = { key, request: withoutCredentials(request), label, createdAt: now, state: 'pending' };
    if (JSON.stringify(item).length > MAX_ITEM_CHARS) return false;
    this.items.push(item);
    return this.save();
  }

  /** Drops an item (the user cancelled it). */
  async cancel(key: string): Promise<void> {
    await this.load();
    const before = this.items.length;
    this.items = this.items.filter((i) => i.key !== key);
    if (this.items.length !== before) await this.save();
  }

  /** Puts a refused item back to pending (the user fixed what was wrong elsewhere and retries). */
  async retry(key: string): Promise<void> {
    await this.load();
    const item = this.items.find((i) => i.key === key);
    if (!item || item.state === 'pending') return;
    item.state = 'pending';
    delete item.error;
    await this.save();
  }

  /** The user saw that the queue was recovered from its previous copy. */
  acknowledgeRecovery(): void {
    if (this.currentStatus !== 'recovered') return;
    this.currentStatus = 'ok';
    this.notify();
  }

  /** The user chose to throw away a damaged queue (its content cannot be read): only then is it
   *  deleted, and new changes can be queued again. */
  async discardDamaged(): Promise<void> {
    await this.load();
    if (this.currentStatus !== 'damaged') return;
    await generations.discard(this.store, this.key).catch(() => undefined);
    this.items = [];
    this.currentStatus = 'ok';
    this.notify();
  }

  /**
   * Sends the pending items in order, one at a time, each with its own key. Before EACH send the
   * queue's owner is compared with `currentOwner` (who is signed in now): anyone else — or nobody —
   * and nothing is sent (`notOwner`; the queue waits for its owner). Stops at the first one that
   * cannot go yet (no connection, the server failing: it stays pending), that needs a sign-in
   * (stays pending: the caller asks to sign in and drains again) or that the server refused (it is
   * marked refused and stays at the head). A refused head blocks the queue until retried or
   * cancelled. Concurrent calls share one drain.
   */
  drain(send: Sender, online: () => boolean = () => true, currentOwner: CurrentOwner = () => ANONYMOUS_OWNER): Promise<DrainResult> {
    if (this.draining) return this.draining;
    this.draining = this.drainNow(send, online, currentOwner).finally(() => {
      this.draining = null;
    });
    return this.draining;
  }

  private async drainNow(send: Sender, online: () => boolean, currentOwner: CurrentOwner): Promise<DrainResult> {
    await this.load();
    const sent: QueuedItem[] = [];
    while (this.items.length > 0) {
      const item = this.items[0];
      if (item.state === 'refused') return { sent, stoppedBy: { kind: 'refused', message: item.error ?? '', item } };
      let signedIn: string | null;
      try {
        signedIn = await currentOwner();
      } catch {
        signedIn = null;
      }
      if (signedIn !== this.owner) return { sent, stoppedBy: { kind: 'notOwner', item } };
      const outcome = await sendOne(send, item, online());
      if (outcome.kind === 'sent') {
        // removed by key: the user may have cancelled something meanwhile
        this.items = this.items.filter((i) => i.key !== item.key);
        sent.push(item);
        await this.save();
        continue;
      }
      if (outcome.kind === 'refused') {
        item.state = 'refused';
        item.error = outcome.message;
        await this.save();
      }
      return { sent, stoppedBy: { ...outcome, item } };
    }
    return { sent };
  }

  private load(): Promise<void> {
    if (!this.loaded) {
      this.loaded = readQueue(this.store, this.key, this.owner).then(
        ({ items, status }) => {
          this.items = items;
          this.currentStatus = status;
          // what was recovered is written back as the current version (the status stays until seen)
          if (status === 'recovered') void this.save();
          void dropLegacy(this.store, this.uiId);
        },
        () => {
          this.items = [];
          this.currentStatus = 'unavailable';
          this.loaded = null; // the next use reads again
        },
      );
    }
    return this.loaded;
  }

  /** Writes the CURRENT items (read when the write runs, so overlapping saves keep the latest). */
  private async save(): Promise<boolean> {
    let ok = true;
    try {
      if (this.items.length === 0) await generations.remove(this.store, this.key);
      else {
        await rememberOwner(this.store, this.uiId, digest(this.owner));
        await generations.write(this.store, this.key, () => JSON.stringify({ v: 1, owner: this.owner, items: this.items } satisfies Stored));
      }
    } catch {
      ok = false; // a full store: the item lives in memory for this launch only
    }
    this.notify();
    return ok;
  }

  private notify(): void {
    for (const l of [...this.listeners]) l([...this.items]);
    for (const l of [...anyChange]) l(this.uiId);
  }
}

/** Reads a queue: its items when it reads back whole AND belongs to `owner`; recovered from the
 *  previous version, or damaged — never an empty queue in place of one that could not be read.
 *  Throws when the store itself cannot be read. */
async function readQueue(store: KeyValueStore, key: string, owner: string): Promise<{ items: QueuedItem[]; status: QueueStatus }> {
  const read = await generations.read(store, key, (value) => {
    const parsed = JSON.parse(value) as Stored;
    return !!parsed && parsed.v === 1 && parsed.owner === owner && Array.isArray(parsed.items);
  });
  if (read.kind === 'empty') return { items: [], status: 'ok' };
  if (read.kind === 'damaged') return { items: [], status: 'damaged' };
  const stored = JSON.parse(read.value) as Stored;
  return { items: stored.items.filter(isItem), status: read.recovered ? 'recovered' : 'ok' };
}

/** The owners (digests) that have (had) a queue on a UI — what removing the UI drops. */
async function ownersOf(store: KeyValueStore, uiId: string): Promise<string[]> {
  try {
    const parsed = JSON.parse((await store.get(outboxIndexKeyOf(uiId))) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string' && /^[0-9a-f]{16}$/.test(x)) : [];
  } catch {
    return [];
  }
}

function rememberOwner(store: KeyValueStore, uiId: string, ownerDigest: string): Promise<void> {
  const key = outboxIndexKeyOf(uiId);
  return serialized(key, async () => {
    const owners = await ownersOf(store, uiId);
    if (!owners.includes(ownerDigest)) await store.set(key, JSON.stringify([...owners, ownerDigest]));
  });
}

/** The pre-owner layout of a UI's queue: not attributable to anyone, so never sent — dropped. */
async function dropLegacy(store: KeyValueStore, uiId: string): Promise<void> {
  const key = legacyKeyOf(uiId);
  try {
    const raw = await store.get(`${key}.n`);
    if (raw === null) return;
    const count = Number(raw) || 0;
    await store.remove(`${key}.n`);
    for (let i = 0; i < count; i++) await store.remove(`${key}.${i}`);
  } catch {
    // tried again next time
  }
}

function isItem(x: unknown): boolean {
  const i = x as QueuedItem | null;
  return !!i && typeof i.key === 'string' && !!i.request && typeof i.request.actionId === 'string';
}

/** The body only — never a header or a token, whatever a caller passes in. */
function withoutCredentials(request: QueuedRequest): QueuedRequest {
  const { route, consumedRoute, actionId, serverSideType, initiatorComponentId, componentState, appState, parameters, embeddedChrome, timeoutMillis } = request;
  return { route, consumedRoute, actionId, serverSideType, initiatorComponentId, componentState, appState, parameters, embeddedChrome, timeoutMillis };
}

/** The user-facing texts of the queue (English; the app's chrome language). */
export const OUTBOX_TEXTS = {
  queued: 'Pending — will be sent when you\'re back online.',
  pendingOne: '1 change pending — will be sent when you\'re back online.',
  pendingMany: (n: number) => `${n} changes pending — will be sent when you're back online.`,
  sent: (n: number) => (n === 1 ? 'Your pending change was sent.' : `${n} pending changes were sent.`),
  refused: 'A pending change was not accepted',
  signIn: 'Sign in again to send your pending changes.',
  full: 'No connection, and too many changes are already waiting. This one was not kept.',
};

/** The words of a queue that could not be read back whole, in the app's chrome language. */
export interface OutboxRecoveryTexts {
  /** The stored queue is damaged: nothing of it can be read. */
  damaged: string;
  /** The button that throws it away (explicitly). */
  discard: string;
  /** What the discard asks before it goes. */
  discardConfirm: string;
  /** A change could not be kept because the stored queue is damaged. */
  notKeptDamaged: string;
  /** The queue was read from its previous copy. */
  recovered: string;
  /** Dismisses the recovered notice. */
  understood: string;
}

const RECOVERY_TEXTS: Record<ChromeLanguage, OutboxRecoveryTexts> = {
  en: {
    damaged: 'Your pending changes saved on this device could not be read. They cannot be sent.',
    discard: 'Discard them',
    discardConfirm: 'Discard the unreadable pending changes? This cannot be undone.',
    notKeptDamaged: 'No connection, and the pending changes on this device could not be read. This one was not kept.',
    recovered: 'The list of pending changes was restored from its previous copy. Check that it is complete.',
    understood: 'OK',
  },
  es: {
    damaged: 'No se han podido leer los cambios pendientes guardados en este dispositivo. No se pueden enviar.',
    discard: 'Descartarlos',
    discardConfirm: '¿Descartar los cambios pendientes ilegibles? No se puede deshacer.',
    notKeptDamaged: 'Sin conexión, y no se han podido leer los cambios pendientes de este dispositivo. Este no se ha guardado.',
    recovered: 'La lista de cambios pendientes se ha restaurado desde su copia anterior. Comprueba que esté completa.',
    understood: 'Entendido',
  },
  fr: {
    damaged: 'Les modifications en attente enregistrées sur cet appareil sont illisibles. Elles ne peuvent pas être envoyées.',
    discard: 'Les supprimer',
    discardConfirm: 'Supprimer les modifications en attente illisibles ? Cette action est irréversible.',
    notKeptDamaged: "Pas de connexion, et les modifications en attente de cet appareil sont illisibles. Celle-ci n'a pas été conservée.",
    recovered: 'La liste des modifications en attente a été restaurée depuis sa copie précédente. Vérifiez qu’elle est complète.',
    understood: 'OK',
  },
  de: {
    damaged: 'Die auf diesem Gerät gespeicherten ausstehenden Änderungen konnten nicht gelesen werden. Sie können nicht gesendet werden.',
    discard: 'Verwerfen',
    discardConfirm: 'Die unlesbaren ausstehenden Änderungen verwerfen? Dies kann nicht rückgängig gemacht werden.',
    notKeptDamaged: 'Keine Verbindung, und die ausstehenden Änderungen auf diesem Gerät konnten nicht gelesen werden. Diese Änderung wurde nicht gespeichert.',
    recovered: 'Die Liste der ausstehenden Änderungen wurde aus ihrer vorherigen Kopie wiederhergestellt. Prüfen Sie, ob sie vollständig ist.',
    understood: 'OK',
  },
  pt: {
    damaged: 'Não foi possível ler as alterações pendentes guardadas neste dispositivo. Elas não podem ser enviadas.',
    discard: 'Descartá-las',
    discardConfirm: 'Descartar as alterações pendentes ilegíveis? Isso não pode ser desfeito.',
    notKeptDamaged: 'Sem conexão, e não foi possível ler as alterações pendentes deste dispositivo. Esta não foi guardada.',
    recovered: 'A lista de alterações pendentes foi restaurada a partir da cópia anterior. Verifique se está completa.',
    understood: 'OK',
  },
  it: {
    damaged: 'Non è stato possibile leggere le modifiche in sospeso salvate su questo dispositivo. Non possono essere inviate.',
    discard: 'Scartale',
    discardConfirm: 'Scartare le modifiche in sospeso illeggibili? Questa operazione non può essere annullata.',
    notKeptDamaged: 'Nessuna connessione, e non è stato possibile leggere le modifiche in sospeso di questo dispositivo. Questa non è stata conservata.',
    recovered: "L'elenco delle modifiche in sospeso è stato ripristinato dalla copia precedente. Verifica che sia completo.",
    understood: 'OK',
  },
};

/** The recovery words in `locale`'s language (chromeLanguage.ts: its primary subtag, else English). */
export function outboxRecoveryTexts(locale: string | null | undefined): OutboxRecoveryTexts {
  return RECOVERY_TEXTS[chromeLanguageOf(locale)];
}

/** Every language the recovery words are written in (the completeness test reads it). */
export const OUTBOX_RECOVERY_TEXTS: Readonly<Record<ChromeLanguage, OutboxRecoveryTexts>> = RECOVERY_TEXTS;
