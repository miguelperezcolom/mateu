import type { KeyValueStore } from '../core/sessionId.ts';

/**
 * A per-listing-scope map that survives an app restart: the base of the saved views and the column
 * choices (the web keeps both in localStorage). Reads are synchronous — the screen draws from what is
 * in memory — and every change is written through to the device's key-value store (AsyncStorage on
 * a device, localStorage on the web build) under ONE key per UI (`<prefix>:<namespace>`, the
 * namespace being the UI's backend), so two UIs in the hub never see each other's choices.
 *
 * What was stored loads when the store is attached; a screen that drew before it landed hears it
 * through `subscribe` (and `whenReady` lets it wait, e.g. to apply a default view once).
 */
export class PersistedScopes<T> {
  protected readonly entries = new Map<string, T>();
  private readonly listeners = new Set<() => void>();
  private kv: KeyValueStore | null = null;
  private storageKey: string | null = null;
  private ready: Promise<void> = Promise.resolve();

  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /** Starts persisting under `namespace` (the UI), loading what an earlier run stored there. */
  attach(kv: KeyValueStore, namespace: string): Promise<void> {
    const key = `${this.prefix}:${namespace}`;
    if (this.kv === kv && this.storageKey === key) return this.ready;
    // re-pointed at another UI: what is in memory belonged to the previous one
    if (this.storageKey !== null) this.entries.clear();
    this.kv = kv;
    this.storageKey = key;
    this.ready = kv
      .get(key)
      .then((raw) => {
        if (this.storageKey !== key || !raw) return;
        const stored = JSON.parse(raw) as Record<string, T>;
        if (!stored || typeof stored !== 'object') return;
        // what this run already chose wins over what was stored
        for (const [scope, value] of Object.entries(stored)) if (!this.entries.has(scope)) this.entries.set(scope, value);
        this.emit();
      })
      .catch(() => {
        // unreadable storage: the choices simply last this session
      });
    return this.ready;
  }

  /** Resolves once what was stored has been loaded (at once when nothing is attached). */
  whenReady(): Promise<void> {
    return this.ready;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  protected read(scope: string): T | undefined {
    return this.entries.get(scope);
  }

  protected write(scope: string, value: T | undefined): void {
    if (value === undefined) this.entries.delete(scope);
    else this.entries.set(scope, value);
    this.persist();
  }

  private persist(): void {
    if (!this.kv || !this.storageKey) return;
    const kv = this.kv;
    const key = this.storageKey;
    const done = this.entries.size === 0 ? kv.remove(key) : kv.set(key, JSON.stringify(Object.fromEntries(this.entries)));
    done.catch(() => {
      // a full or unavailable store: the choice still holds for this session
    });
  }

  private emit(): void {
    for (const listener of [...this.listeners]) listener();
  }
}

let listingPrefsKv: KeyValueStore | null = null;

/** Where listing choices are persisted (set once at boot; tests and the pure core leave it unset). */
export const setListingPrefsStorage = (kv: KeyValueStore | null): void => {
  listingPrefsKv = kv;
};

export const listingPrefsStorage = (): KeyValueStore | null => listingPrefsKv;

/** A listing's scope: the UI is the store's namespace; the route and the listing tell listings apart. */
export const listingScopeOf = (route: string | null | undefined, listingId: string | null | undefined): string =>
  `${(route ?? '').replace(/^\/+|\/+$/g, '')}#${listingId ?? ''}`;
