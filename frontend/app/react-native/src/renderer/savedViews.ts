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

export class SavedViewsStore {
  private readonly store = new Map<string, SavedView[]>();

  list(scope: string): SavedView[] {
    return this.store.get(scope) ?? [];
  }

  /** Save (or replace, matching by name) a view. Empty names / empty snapshots are ignored. */
  save(scope: string, view: SavedView): void {
    const name = view.name?.trim();
    if (!name || Object.keys(view.values ?? {}).length === 0) return;
    const views = this.list(scope).filter((v) => v.name !== name);
    views.push({ ...view, name });
    this.store.set(scope, views);
  }

  delete(scope: string, name: string): void {
    const views = this.list(scope).filter((v) => v.name !== name);
    if (views.length === 0) this.store.delete(scope);
    else this.store.set(scope, views);
  }

  /** Toggle the default flag on `name` (clearing it from every other view in the scope). */
  setDefault(scope: string, name: string): void {
    const views = this.list(scope).map((v) => ({
      ...v,
      isDefault: v.name === name ? !v.isDefault : false,
    }));
    this.store.set(scope, views);
  }

  defaultView(scope: string): SavedView | undefined {
    return this.list(scope).find((v) => v.isDefault);
  }
}

/** The process-wide views: the single-backend app's (each hub session owns its own). */
export const sharedSavedViews = new SavedViewsStore();

export const listSavedViews = (scope: string): SavedView[] => sharedSavedViews.list(scope);

/** Save (or replace, matching by name) a view. Empty names / empty snapshots are ignored. */
export const saveView = (scope: string, view: SavedView): void => sharedSavedViews.save(scope, view);

export const deleteView = (scope: string, name: string): void => sharedSavedViews.delete(scope, name);

/** Toggle the default flag on `name` (clearing it from every other view in the scope). */
export const setDefaultView = (scope: string, name: string): void => sharedSavedViews.setDefault(scope, name);

export const defaultView = (scope: string): SavedView | undefined => sharedSavedViews.defaultView(scope);
