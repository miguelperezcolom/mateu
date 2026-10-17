/**
 * Per-user column personalization for React Native listings — the RN counterpart of the web's
 * `columnPrefsStore` (which show/hide). Parity note: the web persists in localStorage; this RN
 * renderer deliberately does not depend on AsyncStorage, so prefs are **session-scoped**
 * (in-memory, keyed by the listing scope) and reset on app restart. Reorder is not offered on
 * mobile (columns are few and the table scrolls horizontally).
 */
export class ColumnPrefsStore {
  private readonly store = new Map<string, string[]>();

  /** The hidden column ids for a listing scope (empty when the user has hidden none). */
  get(scope: string): string[] {
    return this.store.get(scope) ?? [];
  }

  /** Persist the hidden column ids for a scope (session-scoped). */
  set(scope: string, ids: string[]): void {
    if (ids.length === 0) this.store.delete(scope);
    else this.store.set(scope, [...ids]);
  }
}

/** The process-wide prefs: the single-backend app's (each hub session owns its own). */
export const sharedColumnPrefs = new ColumnPrefsStore();

/** The hidden column ids for a listing scope (empty when the user has hidden none). */
export const getHiddenColumns = (scope: string): string[] => sharedColumnPrefs.get(scope);

/** Persist the hidden column ids for a scope (session-scoped). */
export const setHiddenColumns = (scope: string, ids: string[]): void => sharedColumnPrefs.set(scope, ids);
