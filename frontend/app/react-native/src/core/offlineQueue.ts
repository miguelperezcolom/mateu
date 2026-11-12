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
// Never stored: tokens or headers — only the request body. Persisted per UI through a
// `KeyValueStore` (the platform keychain / keystore on devices: expo-secure-store, which encrypts
// at rest), split into chunks because a secure-store value is limited to ~2 KB.
import { classifyFailure, type FailureKind } from './requestPolicy.ts';
import type { KeyValueStore } from './sessionId.ts';
import { randomUuid } from './sessionId.ts';
import { asArray } from './viewWire.ts';

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

/** Store keys of a UI's queue (secure-store keys allow only [A-Za-z0-9._-]). */
export function outboxKeyOf(uiId: string): string {
  return `mateu.ui.${uiId.replace(/[^A-Za-z0-9._-]/g, '_')}.outbox`;
}

/** Writes `value` under `key` in chunks; reads it back; removes it (every chunk). */
export const chunked = {
  async get(store: KeyValueStore, key: string): Promise<string | null> {
    const count = Number(await store.get(`${key}.n`));
    if (!Number.isInteger(count) || count <= 0) return null;
    let text = '';
    for (let i = 0; i < count; i++) {
      const part = await store.get(`${key}.${i}`);
      if (part === null) return null; // a write interrupted half-way: treat as absent
      text += part;
    }
    return text;
  },
  async set(store: KeyValueStore, key: string, value: string): Promise<void> {
    const previous = Number(await store.get(`${key}.n`)) || 0;
    const parts: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_CHARS) parts.push(value.slice(i, i + CHUNK_CHARS));
    if (parts.length === 0) parts.push('');
    // the count goes LAST: a write interrupted before it leaves the previous value readable
    for (let i = 0; i < parts.length; i++) await store.set(`${key}.${i}`, parts[i]);
    await store.set(`${key}.n`, String(parts.length));
    for (let i = parts.length; i < previous; i++) await store.remove(`${key}.${i}`);
  },
  async remove(store: KeyValueStore, key: string): Promise<void> {
    const count = Number(await store.get(`${key}.n`)) || 0;
    await store.remove(`${key}.n`);
    for (let i = 0; i < count; i++) await store.remove(`${key}.${i}`);
  },
};

/** How sending one item went. */
export type SendOutcome =
  | { kind: 'sent'; increment: unknown }
  | { kind: 'refused'; message: string }
  | { kind: 'waiting'; reason: FailureKind }
  | { kind: 'signInNeeded' };

/** What a drain did: how many went, and why it stopped (if it did before the end). */
export interface DrainResult {
  sent: QueuedItem[];
  stoppedBy?: SendOutcome & { item: QueuedItem };
}

/** Sends one queued request with its key; throws like MateuApiClient.runAction. */
export type Sender = (request: QueuedRequest, idempotencyKey: string) => Promise<unknown>;

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

type Listener = (items: QueuedItem[]) => void;

/** Process-wide: someone's queue changed (the hub list recounts its badges). */
const anyChange = new Set<(uiId: string) => void>();

/** The queue of ONE UI. */
export class OfflineQueue {
  private items: QueuedItem[] = [];
  private loaded: Promise<void> | null = null;
  private draining: Promise<DrainResult> | null = null;
  private listeners = new Set<Listener>();
  private readonly store: KeyValueStore;
  private readonly key: string;
  private readonly uiId: string;

  constructor(store: KeyValueStore, uiId: string) {
    this.store = store;
    this.uiId = uiId;
    this.key = outboxKeyOf(uiId);
  }

  /** Hears every change of any UI's queue (its id); returns the unsubscribe. */
  static onAnyChange(listener: (uiId: string) => void): () => void {
    anyChange.add(listener);
    return () => anyChange.delete(listener);
  }

  /** How many items a UI has queued, without keeping a queue (the hub list's badge). */
  static async countOf(store: KeyValueStore, uiId: string): Promise<number> {
    return (await readItems(store, outboxKeyOf(uiId))).length;
  }

  /** Drops everything a UI queued (the UI was removed from the list). */
  static async clear(store: KeyValueStore, uiId: string): Promise<void> {
    try {
      await chunked.remove(store, outboxKeyOf(uiId));
    } catch {
      // nothing to drop
    }
    for (const l of [...anyChange]) l(uiId);
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

  /** Keeps a request; false when it cannot be kept (the queue is full, the body too large). */
  async enqueue(request: QueuedRequest, key: string, label: string, now = Date.now()): Promise<boolean> {
    await this.load();
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

  /**
   * Sends the pending items in order, one at a time, each with its own key. Stops at the first one
   * that cannot go yet (no connection, the server failing: it stays pending), that needs a sign-in
   * (stays pending: the caller asks to sign in and drains again) or that the server refused (it is
   * marked refused and stays at the head). A refused head blocks the queue until retried or
   * cancelled. Concurrent calls share one drain.
   */
  drain(send: Sender, online: () => boolean = () => true): Promise<DrainResult> {
    if (this.draining) return this.draining;
    this.draining = this.drainNow(send, online).finally(() => {
      this.draining = null;
    });
    return this.draining;
  }

  private async drainNow(send: Sender, online: () => boolean): Promise<DrainResult> {
    await this.load();
    const sent: QueuedItem[] = [];
    while (this.items.length > 0) {
      const item = this.items[0];
      if (item.state === 'refused') return { sent, stoppedBy: { kind: 'refused', message: item.error ?? '', item } };
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
      this.loaded = readItems(this.store, this.key).then((items) => {
        this.items = items;
      });
    }
    return this.loaded;
  }

  private async save(): Promise<boolean> {
    let ok = true;
    try {
      if (this.items.length === 0) await chunked.remove(this.store, this.key);
      else await chunked.set(this.store, this.key, JSON.stringify(this.items));
    } catch {
      ok = false; // a full store: the item lives in memory for this launch only
    }
    for (const l of [...this.listeners]) l([...this.items]);
    for (const l of [...anyChange]) l(this.uiId);
    return ok;
  }
}

async function readItems(store: KeyValueStore, key: string): Promise<QueuedItem[]> {
  try {
    const raw = await chunked.get(store, key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed.filter(isItem) as QueuedItem[]) : [];
  } catch {
    return [];
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
