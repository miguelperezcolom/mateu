/**
 * "My UIs" — the hub's persisted list (pure logic over an injected key/value store; unit-tested).
 *
 * Two stores, never mixed (design/mobile-app-hub.md §3, Security):
 *  - METADATA (this list: base URL, name, icon, colour, timestamps, the cached manifest) lives in
 *    plain app storage (AsyncStorage on devices, localStorage on web) — it is what an export QR may
 *    show anyway, and icons can be larger than the keychain likes.
 *  - SECRETS (each UI's OIDC tokens and its X-Session-Id) live ONLY in the secure store
 *    (expo-secure-store), under keys derived from the entry id — `uiSecretKeys(id)`. Removing an
 *    entry removes those keys; nothing here ever reads a token.
 */
import type { KeyValueStore } from '../core/sessionId.ts';
import { domainOf, normalizeBaseUrl } from './links.ts';
import type { UiManifest } from './manifest.ts';

export const ENTRIES_KEY = 'mateu.hub.entries';
export const SEEDED_KEY = 'mateu.hub.seeded';

/** The "Try a demo" entry preinstalled on first launch (store review: useful without an account). */
export const DEMO_BASE_URL = 'https://demo.mateu.io/counter';

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
}

/** The secure-store keys of one UI. SecureStore keys allow only [A-Za-z0-9._-]. */
export function uiSecretKeys(id: string): { tokens: string; sessionId: string } {
  const safe = id.replace(/[^A-Za-z0-9._-]/g, '_');
  return { tokens: `mateu.ui.${safe}.tokens`, sessionId: `mateu.ui.${safe}.sessionId` };
}

const randomId = (): string => {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  const b = new Uint8Array(9);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  return 'u' + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
};

function sanitizeEntries(raw: unknown): HubEntry[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: HubEntry[] = [];
  for (const e of raw) {
    if (!e || typeof e !== 'object') continue;
    const r = e as Record<string, unknown>;
    if (typeof r['id'] !== 'string' || typeof r['baseUrl'] !== 'string') continue;
    // a stored entry is re-validated: storage is not a trust boundary we control on every platform
    const n = normalizeBaseUrl(r['baseUrl'], { allowInsecure: true });
    if (!n.ok || seen.has(n.baseUrl) || seen.has(r['id'])) continue;
    seen.add(n.baseUrl);
    seen.add(r['id']);
    out.push({
      id: r['id'],
      baseUrl: n.baseUrl,
      name: typeof r['name'] === 'string' && r['name'] ? r['name'] : domainOf(n.baseUrl),
      shortName: typeof r['shortName'] === 'string' ? r['shortName'] : undefined,
      icon: typeof r['icon'] === 'string' ? r['icon'] : undefined,
      themeColor: typeof r['themeColor'] === 'string' ? r['themeColor'] : undefined,
      addedAt: typeof r['addedAt'] === 'number' ? r['addedAt'] : 0,
      lastOpened: typeof r['lastOpened'] === 'number' ? r['lastOpened'] : undefined,
      manifest: r['manifest'] && typeof r['manifest'] === 'object' ? (r['manifest'] as UiManifest) : undefined,
    });
  }
  return out;
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
  private listeners = new Set<(entries: HubEntry[]) => void>();

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

  /** Loads the list; on the very first launch seeds the demo entry (once — removing it sticks). */
  async load(): Promise<HubEntry[]> {
    if (this.loaded) return this.entries;
    let raw: string | null = null;
    try {
      raw = await this.meta.get(ENTRIES_KEY);
    } catch {
      raw = null;
    }
    try {
      this.entries = sanitizeEntries(raw ? JSON.parse(raw) : []);
    } catch {
      this.entries = [];
    }
    this.loaded = true;
    let seeded: string | null = null;
    try {
      seeded = await this.meta.get(SEEDED_KEY);
    } catch {
      seeded = '1';
    }
    if (!seeded) {
      if (this.entries.length === 0) {
        this.entries = [this.make(DEMO_BASE_URL, { name: 'Try a demo', shortName: 'Demo' })];
        await this.persist();
      }
      await this.meta.set(SEEDED_KEY, '1').catch(() => {});
    }
    return this.entries;
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
    return {
      id: this.newId(),
      baseUrl,
      name: manifest?.name || domainOf(baseUrl),
      shortName: manifest?.shortName,
      icon: manifest?.icon,
      themeColor: manifest?.themeColor,
      addedAt: this.now(),
      manifest: manifest?.name ? (manifest as UiManifest) : undefined,
    };
  }

  private async persist(): Promise<void> {
    try {
      await this.meta.set(ENTRIES_KEY, JSON.stringify(this.entries));
    } catch {
      // kept in memory for this launch
    }
    for (const l of [...this.listeners]) l(this.entries);
  }

  /** Adds (or returns the existing entry for) a base URL. `added` tells which. */
  async add(baseUrl: string, manifest?: UiManifest): Promise<{ entry: HubEntry; added: boolean }> {
    await this.load();
    const existing = this.findByBaseUrl(baseUrl);
    if (existing) return { entry: existing, added: false };
    const entry = this.make(baseUrl, manifest);
    this.entries = [...this.entries, entry];
    await this.persist();
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
    if (added) await this.persist();
    return added;
  }

  /** Removes an entry AND its secrets (tokens, session id) — sign-out of that UI only. */
  async remove(id: string): Promise<void> {
    await this.load();
    this.entries = this.entries.filter((e) => e.id !== id);
    await this.persist();
    await this.clearSecrets(id);
  }

  async clearSecrets(id: string): Promise<void> {
    const keys = uiSecretKeys(id);
    await this.secrets.remove(keys.tokens).catch(() => {});
    await this.secrets.remove(keys.sessionId).catch(() => {});
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
    await this.persist();
  }

  /** Applies a full order (ids not mentioned keep their relative order at the end). */
  async reorder(ids: string[]): Promise<void> {
    await this.load();
    const byId = new Map(this.entries.map((e) => [e.id, e]));
    const ordered = ids.map((id) => byId.get(id)).filter((e): e is HubEntry => !!e);
    const rest = this.entries.filter((e) => !ids.includes(e.id));
    this.entries = [...ordered, ...rest];
    await this.persist();
  }

  async touch(id: string): Promise<void> {
    await this.load();
    this.entries = this.entries.map((e) => (e.id === id ? { ...e, lastOpened: this.now() } : e));
    await this.persist();
  }

  /** Refreshes name/icon/colour from a newly fetched manifest (a rename reaches every phone). */
  async applyManifest(id: string, manifest: UiManifest): Promise<void> {
    await this.load();
    this.entries = this.entries.map((e) =>
      e.id === id
        ? { ...e, name: manifest.name, shortName: manifest.shortName, icon: manifest.icon, themeColor: manifest.themeColor, manifest }
        : e,
    );
    await this.persist();
  }

  /** What "Export my UIs" carries: base URLs only, in list order. */
  exportBaseUrls(): string[] {
    return this.entries.map((e) => e.baseUrl);
  }
}
