import type { KeyValueStore } from './sessionId.ts';
import type { ColumnPrefsStore } from '../renderer/columnPrefs.ts';
import type { SavedView, SavedViewsStore } from '../renderer/savedViews.ts';

/**
 * Saved views and column choices on the DEVICE — the RN counterpart of the web's localStorage
 * stores (`savedViewsStore.ts` / `columnPrefsStore.ts`). One record per UI (the hub entry id, or the
 * base url of a fixed build) holding every listing's choices; the session's in-memory stores are
 * restored from it before the first screen and write it back on every change. Removing the UI from
 * the hub list clears it (`clearListingPrefs`), like its tokens and snapshots.
 */
export interface ListingPrefsSnapshot {
  /** hidden column ids by listing scope */
  columns: Record<string, string[]>;
  /** saved views by listing scope */
  views: Record<string, SavedView[]>;
}

export const listingPrefsKey = (uiScope: string): string => `mateu-listing-prefs:${uiScope}`;

const empty = (): ListingPrefsSnapshot => ({ columns: {}, views: {} });

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** What was stored, re-validated (storage is not a trust boundary): bad entries are dropped. */
export function sanitizeListingPrefs(raw: unknown): ListingPrefsSnapshot {
  const out = empty();
  if (!isRecord(raw)) return out;
  if (isRecord(raw['columns'])) {
    for (const [scope, ids] of Object.entries(raw['columns'])) {
      if (!Array.isArray(ids)) continue;
      const kept = ids.filter((id): id is string => typeof id === 'string');
      if (kept.length) out.columns[scope] = kept;
    }
  }
  if (isRecord(raw['views'])) {
    for (const [scope, views] of Object.entries(raw['views'])) {
      if (!Array.isArray(views)) continue;
      const kept: SavedView[] = [];
      for (const v of views) {
        if (!isRecord(v) || typeof v['name'] !== 'string' || !v['name'].trim() || !isRecord(v['values'])) continue;
        kept.push({ name: v['name'], values: { ...v['values'] }, ...(v['isDefault'] === true ? { isDefault: true } : {}) });
      }
      if (kept.length) out.views[scope] = kept;
    }
  }
  return out;
}

/** The stored choices of one UI (empty when there are none or the store fails). */
export async function loadListingPrefs(store: KeyValueStore, uiScope: string): Promise<ListingPrefsSnapshot> {
  try {
    const raw = await store.get(listingPrefsKey(uiScope));
    return raw ? sanitizeListingPrefs(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

/** Drops the stored choices of one UI (it was removed from the list). */
export async function clearListingPrefs(store: KeyValueStore, uiScope: string): Promise<void> {
  try {
    await store.remove(listingPrefsKey(uiScope));
  } catch {
    // nothing kept to forget
  }
}

/**
 * Restores [columns] and [views] from [initial] and writes both back to [store] after every change.
 * Writes are chained, so the last change is the one that stays. [initial] follows the changes too,
 * so a session rebuilt from it in the same run (sign out and back in) starts where the last one
 * left, not where the app started. `flushed` settles when the writes queued so far are done.
 */
export function persistListingPrefs(
  columns: ColumnPrefsStore,
  views: SavedViewsStore,
  store: KeyValueStore,
  uiScope: string,
  initial: ListingPrefsSnapshot,
): { flushed: () => Promise<void> } {
  columns.restore(initial.columns);
  views.restore(initial.views);
  let writing: Promise<void> = Promise.resolve();
  const write = () => {
    initial.columns = columns.snapshot();
    initial.views = views.snapshot();
    const text = JSON.stringify(initial);
    writing = writing
      .then(() => store.set(listingPrefsKey(uiScope), text))
      .catch(() => undefined); // a full store only costs the choices of this run
  };
  columns.onChange = write;
  views.onChange = write;
  return { flushed: () => writing };
}
