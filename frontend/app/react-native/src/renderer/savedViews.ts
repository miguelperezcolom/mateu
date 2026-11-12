/**
 * Saved views for React Native listings — the RN counterpart of the web's `savedViewsStore`: a
 * named snapshot of the smart-search conditions (free-text `searchText` + every applied filter
 * value, range bounds included), with one optionally marked default (auto-applied on first load).
 * Kept per listing scope (the route + the listing) and persisted per UI on the device
 * (`PersistedScopes`: AsyncStorage, localStorage on the web build), like the web's localStorage.
 */
import { PersistedScopes } from './persistedScopes.ts';

export interface SavedView {
  name: string;
  /** filter values by state key (searchText + <fieldId> / <fieldId>_from / <fieldId>_to …) */
  values: Record<string, unknown>;
  isDefault?: boolean;
}

export class SavedViewsStore extends PersistedScopes<SavedView[]> {
  constructor() {
    super('mateu-saved-views');
  }

  list(scope: string): SavedView[] {
    return this.read(scope) ?? [];
  }

  /** Save (or replace, matching by name) a view. Empty names / empty snapshots are ignored. */
  save(scope: string, view: SavedView): void {
    const name = view.name?.trim();
    if (!name || Object.keys(view.values ?? {}).length === 0) return;
    const views = this.list(scope).filter((v) => v.name !== name);
    views.push({ ...view, name });
    this.write(scope, views);
  }

  delete(scope: string, name: string): void {
    const views = this.list(scope).filter((v) => v.name !== name);
    this.write(scope, views.length === 0 ? undefined : views);
  }

  /** Toggle the default flag on `name` (clearing it from every other view in the scope). */
  setDefault(scope: string, name: string): void {
    const views = this.list(scope).map((v) => ({
      ...v,
      isDefault: v.name === name ? !v.isDefault : false,
    }));
    this.write(scope, views);
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
