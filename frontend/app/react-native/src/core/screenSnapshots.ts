import type { KeyValueStore } from './sessionId.ts';

type Json = Record<string, unknown>;

/** A snapshot larger than this is not kept (a long listing): the next open simply waits for it. */
export const MAX_SNAPSHOT_CHARS = 256 * 1024;
/** Screens kept per UI, most recent first. */
export const MAX_SNAPSHOTS = 20;

/**
 * The last screens of ONE UI, shown at once the next time they are opened while the fresh answer is
 * on its way (stale-while-revalidate) — what makes reopening a UI feel instant.
 *
 * Only the FRAGMENTS of an answer are kept: its commands (navigate, close, run JS…) and messages
 * (toasts) would replay as if they had just happened. Never used for a UI that signs in (the host
 * does not pass one): what a signed-in screen shows is not to be left on the device unencrypted.
 * Everything of a UI goes when it is removed from the list (`clear`).
 */
export class ScreenSnapshots {
  private readonly store: KeyValueStore;
  private readonly scope: string;

  constructor(store: KeyValueStore, scope: string) {
    this.store = store;
    this.scope = scope;
  }

  /** The key of a load: what was asked (route, consumed route, server-side type). */
  keyOf(route: string, consumedRoute: string, serverSideType: string): string {
    return `mateu-snap:${this.scope}:${route}|${consumedRoute}|${serverSideType}`;
  }

  async get(key: string): Promise<Json | null> {
    try {
      const raw = await this.store.get(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' && Array.isArray((parsed as Json)['fragments']) ? (parsed as Json) : null;
    } catch {
      return null;
    }
  }

  async put(key: string, increment: unknown): Promise<void> {
    const snapshot = snapshotOf(increment);
    if (!snapshot) return;
    const text = JSON.stringify(snapshot);
    if (text.length > MAX_SNAPSHOT_CHARS) return;
    try {
      await this.store.set(key, text);
      const index = (await this.index()).filter((k) => k !== key);
      index.unshift(key);
      for (const old of index.splice(MAX_SNAPSHOTS)) await this.store.remove(old);
      await this.store.set(this.indexKey(), JSON.stringify(index));
    } catch {
      // a full store only costs the next open its head start
    }
  }

  /** Drops every snapshot of this UI (it was removed from the list). */
  async clear(): Promise<void> {
    try {
      for (const key of await this.index()) await this.store.remove(key);
      await this.store.remove(this.indexKey());
    } catch {
      // ignore
    }
  }

  private indexKey(): string {
    return `mateu-snap-index:${this.scope}`;
  }

  private async index(): Promise<string[]> {
    try {
      const raw = await this.store.get(this.indexKey());
      const list = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(list) ? list.filter((k): k is string => typeof k === 'string') : [];
    } catch {
      return [];
    }
  }
}

/** What of an answer may be shown again: its fragments, nothing that ACTS. null = nothing worth it. */
export function snapshotOf(increment: unknown): Json | null {
  if (!increment || typeof increment !== 'object') return null;
  const fragments = (increment as Json)['fragments'];
  if (!Array.isArray(fragments) || fragments.length === 0) return null;
  const out: Json = { fragments, commands: [], messages: [] };
  const appState = (increment as Json)['appState'];
  if (appState && typeof appState === 'object') out['appState'] = appState;
  return out;
}
