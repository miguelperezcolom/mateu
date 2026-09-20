/**
 * Per-user column personalization for React Native listings — the RN counterpart of the web's
 * `columnPrefsStore` (which show/hide). Parity note: the web persists in localStorage; this RN
 * renderer deliberately does not depend on AsyncStorage, so prefs are **session-scoped**
 * (in-memory, keyed by the listing scope) and reset on app restart. Reorder is not offered on
 * mobile (columns are few and the table scrolls horizontally).
 */
const store = new Map<string, string[]>();

/** The hidden column ids for a listing scope (empty when the user has hidden none). */
export const getHiddenColumns = (scope: string): string[] => store.get(scope) ?? [];

/** Persist the hidden column ids for a scope (session-scoped). */
export const setHiddenColumns = (scope: string, ids: string[]): void => {
  if (ids.length === 0) store.delete(scope);
  else store.set(scope, [...ids]);
};
