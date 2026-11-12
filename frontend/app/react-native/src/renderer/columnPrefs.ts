/**
 * Per-user column personalization for React Native listings — the RN counterpart of the web's
 * `columnPrefsStore`: which columns are hidden and the order the user put them in. Kept per listing
 * scope (the route + the listing) and persisted per UI on the device (`PersistedScopes`:
 * AsyncStorage, localStorage on the web build), like the web's localStorage.
 */
import { PersistedScopes } from './persistedScopes.ts';

export interface ColumnPrefs {
  /** The hidden column ids. */
  hidden: string[];
  /** The user's column order (ids); columns it does not name keep their declared place after them. */
  order?: string[];
}

export class ColumnPrefsStore extends PersistedScopes<ColumnPrefs> {
  constructor() {
    super('mateu-column-prefs');
  }

  /** The hidden column ids for a listing scope (empty when the user has hidden none). */
  get(scope: string): string[] {
    return this.read(scope)?.hidden ?? [];
  }

  /** The user's column order for a scope (empty = the declared order). */
  order(scope: string): string[] {
    return this.read(scope)?.order ?? [];
  }

  /** Persist the hidden column ids for a scope. */
  set(scope: string, ids: string[]): void {
    this.update(scope, { hidden: [...ids] });
  }

  /** Persist the column order for a scope. */
  setOrder(scope: string, ids: string[]): void {
    this.update(scope, { order: [...ids] });
  }

  private update(scope: string, change: Partial<ColumnPrefs>): void {
    const next: ColumnPrefs = { hidden: this.get(scope), order: this.order(scope), ...change };
    const empty = next.hidden.length === 0 && (next.order?.length ?? 0) === 0;
    this.write(scope, empty ? undefined : { hidden: next.hidden, ...(next.order?.length ? { order: next.order } : {}) });
  }
}

/**
 * The columns in the user's order: those the order names first, as it names them, then the rest in
 * their declared order (a column added to the listing later still shows up). Ids the listing no
 * longer has are ignored. The first declared column — the record's identity / the row link — stays
 * first whatever the order says.
 */
export function orderColumns<C extends { fieldId: string }>(columns: C[], order: string[] | null | undefined, keepFirst = true): C[] {
  if (!order || order.length === 0 || columns.length < 2) return columns;
  const pinned = keepFirst ? columns[0] : undefined;
  const rest = keepFirst ? columns.slice(1) : columns;
  const byId = new Map(rest.map((c) => [c.fieldId, c] as const));
  const ordered: C[] = [];
  for (const id of order) {
    const c = byId.get(id);
    if (c) {
      ordered.push(c);
      byId.delete(id);
    }
  }
  for (const c of rest) if (byId.has(c.fieldId)) ordered.push(c);
  return pinned ? [pinned, ...ordered] : ordered;
}

/** The order after moving `id` one place up (-1) or down (+1) among `columns` (their current order). */
export function moveColumn(columnIds: string[], id: string, delta: -1 | 1, keepFirst = true): string[] {
  const ids = [...columnIds];
  const at = ids.indexOf(id);
  const to = at + delta;
  const floor = keepFirst ? 1 : 0;
  if (at < floor || to < floor || to >= ids.length) return ids;
  [ids[at], ids[to]] = [ids[to]!, ids[at]!];
  return ids;
}

/** The process-wide prefs: the single-backend app's (each hub session owns its own). */
export const sharedColumnPrefs = new ColumnPrefsStore();

/** The hidden column ids for a listing scope (empty when the user has hidden none). */
export const getHiddenColumns = (scope: string): string[] => sharedColumnPrefs.get(scope);

/** Persist the hidden column ids for a scope. */
export const setHiddenColumns = (scope: string, ids: string[]): void => sharedColumnPrefs.set(scope, ids);
