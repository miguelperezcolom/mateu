/**
 * "My UIs" — the hub's persisted list (pure logic over an injected key/value store; unit-tested).
 *
 * Two stores, never mixed (design/mobile-app-hub.md §3, Security):
 *  - METADATA (this list: base URL, name, icon, colour, timestamps, the cached manifest) lives in
 *    plain app storage (AsyncStorage on devices, localStorage on web) — it is what an export QR may
 *    show anyway, and icons can be larger than the keychain likes. It is part of the device's
 *    backup (Android Auto Backup: plugins/with-hub-backup.js; iOS: app data is backed up).
 *  - SECRETS (each UI's OIDC tokens and its X-Session-Id) live ONLY in the secure store
 *    (expo-secure-store), under keys derived from the entry id — `uiSecretKeys(id)`. Removing an
 *    entry removes those keys; nothing here ever reads a token. They are NOT backed up.
 *
 * Keeping the list (it is the user's, and losing it means re-scanning every QR):
 *  - the list key holds METADATA ONLY; each entry's icon and cached manifest have their own keys
 *    (`entryKeys(id)`) — Android's AsyncStorage cannot read a value over ~2 MB, so one key carrying
 *    every icon and manifest could become unreadable. The old one-key format still loads and is
 *    split on the first load;
 *  - before the list is replaced, the value it replaces is kept under PREVIOUS_KEY;
 *  - a list that cannot be read is never written over: its raw text is put aside (UNREADABLE_KEY,
 *    once), the previous copy is shown when there is one, and nothing is written until the user
 *    changes the list themselves;
 *  - an entry whose address a stricter check now refuses stays on the list, marked `invalid`.
 */
import type { KeyValueStore } from '../core/sessionId.ts';
import { domainOf, normalizeBaseUrl } from './links.ts';
import type { UiManifest } from './manifest.ts';

export const ENTRIES_KEY = 'mateu.hub.entries';
export const SEEDED_KEY = 'mateu.hub.seeded';
/** The list as it was before the last write — what a start whose list cannot be read falls back to. */
export const PREVIOUS_KEY = 'mateu.hub.entries.previous';
/** The raw text of a list that could not be read, put aside ONCE and never overwritten. */
export const UNREADABLE_KEY = 'mateu.hub.entries.unreadable';

/** The "Try a demo" entry preinstalled on first launch (store review: useful without an account). */
export const DEMO_BASE_URL = 'https://demo.mateu.io/counter';

/** An icon bigger than this is not kept (the manifest parser already caps data URIs at 200 kB). */
export const MAX_STORED_ICON = 256_000;

export interface HubEntry {
  id: string;
  baseUrl: string;
  name: string;
  shortName?: string;
  icon?: string;
  themeColor?: string;
  addedAt: number;
  lastOpened?: number;
  /** The last manifest fetched, for offline display and the version gate. */
  manifest?: UiManifest;
  /**
   * Why a stored entry's address is no longer accepted (a stricter address check than the one it was
   * added under). The entry stays on the list — shown greyed, removable — instead of vanishing.
   */
  invalid?: string;
}

/**
 * How the last load went:
 *  - `ok`: the list was read;
 *  - `recovered`: it could not be read and the copy kept before the last write is shown;
 *  - `unreadable`: it could not be read and there was no copy to fall back to.
 * Outside `ok` nothing is written until the user changes the list themselves (add, import, remove,
 * reorder) — a list that failed to read is never replaced by what happened to load.
 */
export type ListHealth = 'ok' | 'recovered' | 'unreadable';

/** The line the list shows outside `ok`. */
export function healthNotice(health: ListHealth): string | undefined {
  if (health === 'recovered') {
    return 'Your list could not be read, so the copy saved before its last change is shown. It is saved again when you change it.';
  }
  if (health === 'unreadable') {
    return 'Your list could not be read. It is kept on this phone untouched until you add or remove a UI.';
  }
  return undefined;
}

/** The secure-store keys of one UI. SecureStore keys allow only [A-Za-z0-9._-]. */
export function uiSecretKeys(id: string): { tokens: string; sessionId: string; signInProvider: string } {
  const safe = safeId(id);
  // signInProvider: the id of the provider this UI was last signed in with (the chooser lists it first)
  return { tokens: `mateu.ui.${safe}.tokens`, sessionId: `mateu.ui.${safe}.sessionId`, signInProvider: `mateu.ui.${safe}.signInProvider` };
}

/** The per-entry keys of one UI's icon and cached manifest (outside the list, which stays small). */
export function entryKeys(id: string): { icon: string; manifest: string } {
  const safe = safeId(id);
  return { icon: `mateu.hub.entry.${safe}.icon`, manifest: `mateu.hub.entry.${safe}.manifest` };
}

const safeId = (id: string): string => id.replace(/[^A-Za-z0-9._-]/g, '_');

const randomId = (): string => {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  const b = new Uint8Array(9);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  return 'u' + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
};

interface Sanitized {
  entries: HubEntry[];
  /** Something stored was not an entry at all (it could not be kept). */
  dropped: boolean;
  /** Entries that still carry their icon/manifest inline (the format before the per-entry keys). */
  inline: Set<string>;
}

const iconOf = (v: unknown): string | undefined => (typeof v === 'string' && v && v.length <= MAX_STORED_ICON ? v : undefined);
const manifestOf = (v: unknown): UiManifest | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as UiManifest) : undefined;

function sanitizeEntries(raw: unknown[]): Sanitized {
  const result: Sanitized = { entries: [], dropped: false, inline: new Set() };
  const seen = new Set<string>();
  for (const e of raw) {
    if (!e || typeof e !== 'object') {
      result.dropped = true;
      continue;
    }
    const r = e as Record<string, unknown>;
    if (typeof r['id'] !== 'string' || typeof r['baseUrl'] !== 'string') {
      result.dropped = true;
      continue;
    }
    // a stored entry is re-validated: storage is not a trust boundary we control on every platform.
    // One that no longer passes is KEPT, marked invalid (never opened, shown so it can be removed).
    const n = normalizeBaseUrl(r['baseUrl'], { allowInsecure: true });
    const baseUrl = n.ok ? n.baseUrl : r['baseUrl'];
    // the same UI twice (after normalisation) is one entry: the first one stays
    if (seen.has(baseUrl) || seen.has(r['id'])) continue;
    seen.add(baseUrl);
    seen.add(r['id']);
    if (r['icon'] !== undefined || r['manifest'] !== undefined) result.inline.add(r['id']);
    result.entries.push({
      id: r['id'],
      baseUrl,
      name: typeof r['name'] === 'string' && r['name'] ? r['name'] : domainOf(baseUrl),
      shortName: typeof r['shortName'] === 'string' ? r['shortName'] : undefined,
      icon: iconOf(r['icon']),
      themeColor: typeof r['themeColor'] === 'string' ? r['themeColor'] : undefined,
      addedAt: typeof r['addedAt'] === 'number' ? r['addedAt'] : 0,
      lastOpened: typeof r['lastOpened'] === 'number' ? r['lastOpened'] : undefined,
      manifest: manifestOf(r['manifest']),
      invalid: n.ok ? undefined : n.reason,
    });
  }
  return result;
}

/** Parses a stored list; null when it is not a list at all. */
function parseList(raw: string): Sanitized | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return Array.isArray(parsed) ? sanitizeEntries(parsed) : null;
}

/** What the list key holds: metadata only (icon and manifest go to the per-entry keys). The stored
 *  address is the one read (an invalid entry keeps its original text). */
function slim(e: HubEntry): Record<string, unknown> {
  const { icon: _icon, manifest: _manifest, invalid: _invalid, ...rest } = e;
  return rest;
}

/** Case-insensitive search over name, short name and domain; every word must match. */
export function searchEntries(entries: HubEntry[], query: string): HubEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return entries;
  return entries.filter((e) => {
    const hay = `${e.name} ${e.shortName ?? ''} ${domainOf(e.baseUrl)}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export class UiStore {
  private entries: HubEntry[] = [];
  private loaded = false;
  private loading: Promise<HubEntry[]> | null = null;
  private listeners = new Set<(entries: HubEntry[]) => void>();
  private state: ListHealth = 'ok';
  /** False after a failed read, until the user changes the list themselves. */
  private writable = true;
  /** The list text last read or written: what PREVIOUS_KEY gets before the next write. */
  private lastWritten: string | null = null;
  /** Entries whose icon/manifest keys must be (re)written on the next persist. */
  private dirty = new Set<string>();
  /** Writes run one after the other (a backup and its replacement must not interleave). */
  private writes: Promise<void> = Promise.resolve();

  private readonly meta: KeyValueStore;
  private readonly secrets: KeyValueStore;
  private readonly now: () => number;
  private readonly newId: () => string;

  // (no parameter properties: node --test runs this file with strip-only type stripping)
  constructor(meta: KeyValueStore, secrets: KeyValueStore, now: () => number = Date.now, newId: () => string = randomId) {
    this.meta = meta;
    this.secrets = secrets;
    this.now = now;
    this.newId = newId;
  }

  /** How the list was read (see ListHealth). */
  health(): ListHealth {
    return this.state;
  }

  /** Loads the list; on the very first launch seeds the demo entry (once — removing it sticks). */
  load(): Promise<HubEntry[]> {
    if (this.loaded) return Promise.resolve(this.entries);
    this.loading ??= this.read();
    return this.loading;
  }

  private async getOnce(key: string): Promise<{ ok: true; value: string | null } | { ok: false }> {
    try {
      return { ok: true, value: await this.meta.get(key) };
    } catch {
      return { ok: false };
    }
  }

  /** A read that failed once is tried again (a busy database), then given up. */
  private async getRetrying(key: string): Promise<{ ok: true; value: string | null } | { ok: false }> {
    const first = await this.getOnce(key);
    return first.ok ? first : this.getOnce(key);
  }

  private async read(): Promise<HubEntry[]> {
    const got = await this.getRetrying(ENTRIES_KEY);
    let list: Sanitized | null = null;
    let fresh = false;
    if (!got.ok) {
      // nothing to put aside (the value itself could not be read): fall back to the copy
      list = await this.recover();
    } else if (got.value === null) {
      // no list: a first launch — or a list lost by something else, which the copy brings back
      const previous = await this.getOnce(PREVIOUS_KEY);
      const copy = previous.ok && previous.value ? parseList(previous.value) : null;
      if (copy && copy.entries.length) {
        list = copy;
        this.state = 'recovered';
        this.writable = false;
      } else {
        list = { entries: [], dropped: false, inline: new Set() };
        fresh = true;
      }
    } else {
      list = parseList(got.value);
      if (!list) {
        await this.putAside(got.value);
        list = await this.recover();
      } else {
        // what could not be read as an entry is gone from the list — but not from the device
        if (list.dropped) await this.putAside(got.value);
        this.lastWritten = got.value;
      }
    }
    this.entries = list.entries;
    await this.readEntryKeys(list.inline);
    this.loaded = true;

    if (fresh) {
      let seeded: string | null = null;
      try {
        seeded = await this.meta.get(SEEDED_KEY);
      } catch {
        seeded = '1';
      }
      if (!seeded) {
        this.entries = [this.make(DEMO_BASE_URL, { name: 'Try a demo', shortName: 'Demo' })];
        await this.persist(true);
        await this.meta.set(SEEDED_KEY, '1').catch(() => {});
      }
    } else if (list.inline.size && this.writable) {
      // the old one-key format: split it now (icons and manifests to their own keys)
      await this.persist(false);
    }
    return this.entries;
  }

  /** The copy kept before the last write, after the list itself could not be read. */
  private async recover(): Promise<Sanitized> {
    this.writable = false;
    const previous = await this.getOnce(PREVIOUS_KEY);
    const copy = previous.ok && previous.value ? parseList(previous.value) : null;
    if (copy) {
      this.state = 'recovered';
      return copy;
    }
    this.state = 'unreadable';
    return { entries: [], dropped: false, inline: new Set() };
  }

  /** Keeps the raw text of a list that could not be read — once: a later failure never replaces it. */
  private async putAside(raw: string): Promise<void> {
    try {
      if ((await this.meta.get(UNREADABLE_KEY)) === null) await this.meta.set(UNREADABLE_KEY, raw);
    } catch {
      // the list is still not written over, which is what matters
    }
  }

  /** Each entry's icon and manifest from its own keys (inline ones — the old format — win). */
  private async readEntryKeys(inline: Set<string>): Promise<void> {
    this.entries = await Promise.all(
      this.entries.map(async (e) => {
        if (inline.has(e.id)) {
          this.dirty.add(e.id);
          return e;
        }
        const keys = entryKeys(e.id);
        const [icon, manifest] = await Promise.all([this.getOnce(keys.icon), this.getOnce(keys.manifest)]);
        let parsed: unknown;
        try {
          parsed = manifest.ok && manifest.value ? JSON.parse(manifest.value) : undefined;
        } catch {
          parsed = undefined;
        }
        return { ...e, icon: iconOf(icon.ok ? icon.value : undefined), manifest: manifestOf(parsed) };
      }),
    );
  }

  list(): HubEntry[] {
    return this.entries;
  }

  get(id: string): HubEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  findByBaseUrl(baseUrl: string): HubEntry | undefined {
    return this.entries.find((e) => e.baseUrl === baseUrl);
  }

  subscribe(listener: (entries: HubEntry[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private make(baseUrl: string, manifest?: Partial<UiManifest>): HubEntry {
    const entry: HubEntry = {
      id: this.newId(),
      baseUrl,
      name: manifest?.name || domainOf(baseUrl),
      shortName: manifest?.shortName,
      icon: iconOf(manifest?.icon),
      themeColor: manifest?.themeColor,
      addedAt: this.now(),
      manifest: manifest?.name ? (manifest as UiManifest) : undefined,
    };
    this.dirty.add(entry.id);
    return entry;
  }

  /**
   * Writes the list. `byUser`: the user changed the list themselves — which also ends the read-only
   * state after a failed read (what could not be read was put aside). Otherwise (a refreshed
   * manifest, a "last opened" stamp) nothing is written while the list is in that state.
   */
  private persist(byUser: boolean): Promise<void> {
    for (const l of [...this.listeners]) l(this.entries);
    if (!this.writable && !byUser) return this.writes;
    this.writable = true;
    const entries = this.entries;
    this.writes = this.writes.then(() => this.write(entries));
    return this.writes;
  }

  private async write(entries: HubEntry[]): Promise<void> {
    // icons and manifests first: the list never names an entry whose keys were not attempted
    for (const e of entries) {
      if (!this.dirty.has(e.id)) continue;
      const keys = entryKeys(e.id);
      try {
        if (e.icon) await this.meta.set(keys.icon, e.icon);
        else await this.meta.remove(keys.icon);
        if (e.manifest) await this.meta.set(keys.manifest, JSON.stringify(e.manifest));
        else await this.meta.remove(keys.manifest);
        this.dirty.delete(e.id);
      } catch {
        // a cache (refetched on the next open): tried again on the next write
      }
    }
    const text = JSON.stringify(entries.map(slim));
    if (text === this.lastWritten) {
      if (this.state !== 'ok') this.state = 'ok';
      return;
    }
    try {
      if (this.lastWritten !== null) await this.meta.set(PREVIOUS_KEY, this.lastWritten);
    } catch {
      // the copy is a safety net; the list itself is still written
    }
    try {
      await this.meta.set(ENTRIES_KEY, text);
      this.lastWritten = text;
      this.state = 'ok';
    } catch {
      // kept in memory for this launch
    }
  }

  /** Adds (or returns the existing entry for) a base URL. `added` tells which. */
  async add(baseUrl: string, manifest?: UiManifest): Promise<{ entry: HubEntry; added: boolean }> {
    await this.load();
    const existing = this.findByBaseUrl(baseUrl);
    if (existing) return { entry: existing, added: false };
    const entry = this.make(baseUrl, manifest);
    this.entries = [...this.entries, entry];
    await this.persist(true);
    return { entry, added: true };
  }

  /** Imports several base URLs (no manifest yet — fetched on first open). Returns how many were new. */
  async importAll(baseUrls: string[]): Promise<number> {
    await this.load();
    let added = 0;
    const next = [...this.entries];
    for (const u of baseUrls) {
      if (next.some((e) => e.baseUrl === u)) continue;
      next.push(this.make(u));
      added++;
    }
    this.entries = next;
    if (added) await this.persist(true);
    return added;
  }

  /** Removes an entry, its icon and manifest keys AND its secrets (tokens, session id) — sign-out of
   *  that UI only. */
  async remove(id: string): Promise<void> {
    await this.load();
    this.entries = this.entries.filter((e) => e.id !== id);
    this.dirty.delete(id);
    await this.persist(true);
    const keys = entryKeys(id);
    await this.meta.remove(keys.icon).catch(() => {});
    await this.meta.remove(keys.manifest).catch(() => {});
    await this.clearSecrets(id);
  }

  async clearSecrets(id: string): Promise<void> {
    const keys = uiSecretKeys(id);
    await this.secrets.remove(keys.tokens).catch(() => {});
    await this.secrets.remove(keys.sessionId).catch(() => {});
    await this.secrets.remove(keys.signInProvider).catch(() => {});
  }

  /** Moves an entry by `delta` positions (clamped). */
  async move(id: string, delta: number): Promise<void> {
    await this.load();
    const i = this.entries.findIndex((e) => e.id === id);
    if (i < 0) return;
    const j = Math.max(0, Math.min(this.entries.length - 1, i + delta));
    if (i === j) return;
    const next = [...this.entries];
    const [e] = next.splice(i, 1);
    next.splice(j, 0, e);
    this.entries = next;
    await this.persist(true);
  }

  /** Applies a full order (ids not mentioned keep their relative order at the end). */
  async reorder(ids: string[]): Promise<void> {
    await this.load();
    const byId = new Map(this.entries.map((e) => [e.id, e]));
    const ordered = ids.map((id) => byId.get(id)).filter((e): e is HubEntry => !!e);
    const rest = this.entries.filter((e) => !ids.includes(e.id));
    this.entries = [...ordered, ...rest];
    await this.persist(true);
  }

  async touch(id: string): Promise<void> {
    await this.load();
    this.entries = this.entries.map((e) => (e.id === id ? { ...e, lastOpened: this.now() } : e));
    await this.persist(false);
  }

  /** Refreshes name/icon/colour from a newly fetched manifest (a rename reaches every phone). */
  async applyManifest(id: string, manifest: UiManifest): Promise<void> {
    await this.load();
    this.entries = this.entries.map((e) =>
      e.id === id
        ? { ...e, name: manifest.name, shortName: manifest.shortName, icon: iconOf(manifest.icon), themeColor: manifest.themeColor, manifest }
        : e,
    );
    if (this.get(id)) this.dirty.add(id);
    await this.persist(false);
  }

  /** What "Export my UIs" carries: base URLs only, in list order — every entry, the ones whose
   *  address is no longer accepted too (the importing phone lists them as refused). */
  exportBaseUrls(): string[] {
    return this.entries.map((e) => e.baseUrl);
  }
}
