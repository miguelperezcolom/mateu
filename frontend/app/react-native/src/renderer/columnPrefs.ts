/**
 * Per-user column personalization for React Native listings — the RN counterpart of the web's
 * `columnPrefsStore` (which show/hide). The store itself is in memory, keyed by the listing scope;
 * a hub UI (and a fixed build) restores it from the device and writes every change back
 * (core/listingPrefs.ts — the web's localStorage), so the choices outlive the app; removing the UI
 * from the hub list clears them. Reorder is not offered on mobile (columns are few and the table
 * scrolls horizontally).
 */
export class ColumnPrefsStore {
  private readonly store = new Map<string, string[]>();
  /** Called after every change (core/listingPrefs.ts writes the device copy from it). */
  onChange?: () => void;

  /** The hidden column ids for a listing scope (empty when the user has hidden none). */
  get(scope: string): string[] {
    return this.store.get(scope) ?? [];
  }

  /** Keep the hidden column ids for a scope. */
  set(scope: string, ids: string[]): void {
    if (ids.length === 0) this.store.delete(scope);
    else this.store.set(scope, [...ids]);
    this.onChange?.();
  }

  /** Every scope's hidden ids (what is written to the device). */
  snapshot(): Record<string, string[]> {
    return Object.fromEntries([...this.store].map(([k, v]) => [k, [...v]]));
  }

  /** Replaces the content with a stored [snapshot] (no change notification: nothing changed). */
  restore(snapshot: Record<string, string[]>): void {
    this.store.clear();
    for (const [k, v] of Object.entries(snapshot)) if (v.length) this.store.set(k, [...v]);
  }
}

/** The process-wide prefs: the single-backend app's (each hub session owns its own). */
export const sharedColumnPrefs = new ColumnPrefsStore();

/** The hidden column ids for a listing scope (empty when the user has hidden none). */
export const getHiddenColumns = (scope: string): string[] => sharedColumnPrefs.get(scope);

/** Keep the hidden column ids for a scope. */
export const setHiddenColumns = (scope: string, ids: string[]): void => sharedColumnPrefs.set(scope, ids);
