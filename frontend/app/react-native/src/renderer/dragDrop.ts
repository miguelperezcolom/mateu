/**
 * Dragging listing rows onto a DropZone, the touch way (wire `Crud.dragType` + `DropZone`).
 *
 * Drag-and-drop between components is not a natural touch idiom, so on React Native a listing
 * whose rows can be dragged (`dragType` set — Java `@DragRows`) offers a "Move to…" action over
 * its SELECTED rows instead: it opens a picker of the DropZones present on the screen accepting
 * that type, and picking one runs the zone's action with the zone's `parameters` plus
 * `_draggedIds` (the rows' ids) and `_dragType` — exactly the parameters a web drop sends.
 *
 * The zones are discovered through a tiny mounted-zone registry: every rendered DropZone registers
 * itself (with a `dispatch` bound to ITS OWN view controller — the action belongs to the zone's
 * server-side component, not to the listing's) and unregisters on unmount. Pure logic, no RN
 * imports, so it runs under `node --test`.
 */

export interface DropZoneMeta {
  accept?: string | null;
  actionId?: string | null;
  parameters?: Record<string, unknown> | null;
  title?: string | null;
  subtitle?: string | null;
}

/** A mounted DropZone: its wire metadata + a dispatcher on the zone's own controller. */
export interface MountedDropZone {
  key: string;
  meta: DropZoneMeta;
  dispatch: (actionId: string, parameters: Record<string, unknown>) => void;
}

/** Whether a zone accepts rows of the given drag type (both must be set and equal). */
export function accepts(zone: DropZoneMeta, dragType: string | null | undefined): boolean {
  return !!dragType && !!zone.accept && zone.accept === dragType && !!zone.actionId;
}

/** The id of a listing row (same lookup as the crud's row identity). */
export function rowId(row: Record<string, unknown>): string {
  for (const f of ['id', '_id', 'key', 'uuid']) {
    if (row[f] !== null && row[f] !== undefined) return String(row[f]);
  }
  return '';
}

/** The ids of the dragged rows, in order, without blanks. */
export function draggedIds(rows: Record<string, unknown>[]): string[] {
  return rows.map(rowId).filter((id) => id !== '');
}

/** The parameters of the drop: the zone's own parameters + _draggedIds + _dragType. */
export function dropParameters(
  zone: DropZoneMeta,
  dragType: string,
  ids: string[],
): Record<string, unknown> {
  return { ...(zone.parameters ?? {}), _draggedIds: [...ids], _dragType: dragType };
}

/** The label a zone shows in the picker: title, else subtitle, else its action id. */
export function zoneLabel(zone: DropZoneMeta): string {
  return (zone.title ?? '').trim() || (zone.subtitle ?? '').trim() || String(zone.actionId ?? '');
}

/** The "Move to…" action's label for n selected rows. */
export function moveToLabel(count: number): string {
  return count > 1 ? `Move ${count} rows to…` : 'Move to…';
}

/** Whether the listing should offer "Move to…": draggable and something is selected. */
export function canMove(dragType: string | null | undefined, selectedCount: number): boolean {
  return !!dragType && selectedCount > 0;
}

// ── mounted-zone registry ─────────────────────────────────────────────────────

const zones = new Map<string, MountedDropZone>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

/** Registers (or replaces) a mounted zone; returns its unregister function. */
export function registerDropZone(zone: MountedDropZone): () => void {
  zones.set(zone.key, zone);
  notify();
  return () => {
    if (zones.get(zone.key) === zone) {
      zones.delete(zone.key);
      notify();
    }
  };
}

/** The mounted zones accepting the drag type, in mount order. */
export function zonesAccepting(dragType: string | null | undefined): MountedDropZone[] {
  return [...zones.values()].filter((z) => accepts(z.meta, dragType));
}

/** Subscribes to registry changes; returns the unsubscribe function. */
export function subscribeDropZones(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Runs the drop of `rows` on `zone`: dispatches the zone's action with the drop parameters.
 *  Returns false (and dispatches nothing) when the zone does not accept the type or no row has
 *  an id. */
export function dropOn(zone: MountedDropZone, dragType: string, rows: Record<string, unknown>[]): boolean {
  const ids = draggedIds(rows);
  if (!accepts(zone.meta, dragType) || ids.length === 0) return false;
  zone.dispatch(zone.meta.actionId!, dropParameters(zone.meta, dragType, ids));
  return true;
}
