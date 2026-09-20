/**
 * Saved views for React Native listings — the RN counterpart of the web's `savedViewsStore`: a
 * named snapshot of the smart-search conditions (free-text `searchText` + every applied filter
 * value, range bounds included), with one optionally marked default (auto-applied on first load).
 * Parity note: the web persists in localStorage; this RN renderer has no AsyncStorage dependency, so
 * views are **session-scoped** (in-memory, keyed by the listing scope) and reset on app restart.
 */
export interface SavedView {
  name: string;
  /** filter values by state key (searchText + <fieldId> / <fieldId>_from / <fieldId>_to …) */
  values: Record<string, unknown>;
  isDefault?: boolean;
}

const store = new Map<string, SavedView[]>();

export const listSavedViews = (scope: string): SavedView[] => store.get(scope) ?? [];

/** Save (or replace, matching by name) a view. Empty names / empty snapshots are ignored. */
export const saveView = (scope: string, view: SavedView): void => {
  const name = view.name?.trim();
  if (!name || Object.keys(view.values ?? {}).length === 0) return;
  const views = listSavedViews(scope).filter((v) => v.name !== name);
  views.push({ ...view, name });
  store.set(scope, views);
};

export const deleteView = (scope: string, name: string): void => {
  const views = listSavedViews(scope).filter((v) => v.name !== name);
  if (views.length === 0) store.delete(scope);
  else store.set(scope, views);
};

/** Toggle the default flag on `name` (clearing it from every other view in the scope). */
export const setDefaultView = (scope: string, name: string): void => {
  const views = listSavedViews(scope).map((v) => ({
    ...v,
    isDefault: v.name === name ? !v.isDefault : false,
  }));
  store.set(scope, views);
};

export const defaultView = (scope: string): SavedView | undefined =>
  listSavedViews(scope).find((v) => v.isDefault);
