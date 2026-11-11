/**
 * Dragging listing rows onto a DropZone on a touch screen (wire `Crud.dragType` + `DropZone`).
 *
 * A listing whose rows can be dragged (`dragType` set — Java `@DragRows`) lets a long press lift a
 * row — or the whole selection, when the pressed row is selected, like the web — and carry it over
 * the screen: the zone under the finger accepting the type lights up, and letting go on it runs the
 * zone's action with the zone's `parameters` plus `_draggedIds` (the rows' ids) and `_dragType` —
 * exactly the parameters a web drop sends. A long press released without moving opens the "Move
 * to…" picker instead, which is also the screen reader's (and anyone's) way: a picker of the
 * DropZones on the screen accepting that type, over the SELECTED rows.
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
  /** Where the zone is on the screen now (window coordinates), for a drag; absent = not a target. */
  measure?: () => Promise<ZoneRect | undefined>;
}

/** A zone's box on the screen (window coordinates). */
export interface ZoneRect {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The zone under the finger: the innermost (smallest) box containing the point, or undefined. */
export function zoneAt(rects: ZoneRect[], x: number, y: number): string | undefined {
  const inside = rects.filter((r) => r.width > 0 && r.height > 0 && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height);
  if (inside.length === 0) return undefined;
  return inside.reduce((best, r) => (r.width * r.height < best.width * best.height ? r : best)).key;
}

/** The rows a long press lifts: the selection when the pressed row is part of it, else that row. */
export function rowsToDrag(pressed: Record<string, unknown>, selected: Record<string, unknown>[]): Record<string, unknown>[] {
  const id = rowId(pressed);
  const inSelection = selected.some((r) => r === pressed || (id !== '' && rowId(r) === id));
  return inSelection ? selected : [pressed];
}

/** What the lifted rows show under the finger: the row's title, or "3 rows". */
export function dragPreviewLabel(rows: Record<string, unknown>[], titleOf: (row: Record<string, unknown>) => string): string {
  if (rows.length > 1) return `${rows.length} rows`;
  const first = rows[0];
  return (first ? titleOf(first) : '').trim() || rowId(first ?? {}) || '1 row';
}

/** A finger that moved less than this (dp) while holding did not drag: it asked for the picker. */
export const STILL_DP = 10;

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

/** The zones mounted on ONE app's screens (each hub session owns a registry). */
export class DropZoneRegistry {
  private readonly zones = new Map<string, MountedDropZone>();
  private readonly listeners = new Set<() => void>();
  private drag: { type: string; hovered?: string } | undefined;

  /** The drag in progress (its type and the zone under the finger), if any. */
  dragState(): { type: string; hovered?: string } | undefined {
    return this.drag;
  }

  /** Starts, moves (`hovered`) or ends (undefined) a drag; zones repaint from it. */
  setDrag(drag: { type: string; hovered?: string } | undefined): void {
    if (drag?.type === this.drag?.type && drag?.hovered === this.drag?.hovered) return;
    this.drag = drag;
    this.notify();
  }

  /** The screen boxes of the mounted zones accepting the type (those that can say where they are). */
  async measureAccepting(dragType: string): Promise<ZoneRect[]> {
    const rects = await Promise.all(this.zonesAccepting(dragType).map((z) => z.measure?.().catch(() => undefined)));
    return rects.filter((r): r is ZoneRect => !!r);
  }

  /** A mounted zone by its key. */
  zone(key: string | undefined): MountedDropZone | undefined {
    return key ? this.zones.get(key) : undefined;
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  /** Registers (or replaces) a mounted zone; returns its unregister function. */
  register(zone: MountedDropZone): () => void {
    this.zones.set(zone.key, zone);
    this.notify();
    return () => {
      if (this.zones.get(zone.key) === zone) {
        this.zones.delete(zone.key);
        this.notify();
      }
    };
  }

  /** The mounted zones accepting the drag type, in mount order. */
  zonesAccepting(dragType: string | null | undefined): MountedDropZone[] {
    return [...this.zones.values()].filter((z) => accepts(z.meta, dragType));
  }

  /** Subscribes to registry changes; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/** The process-wide registry: the single-backend app's. */
export const sharedDropZones = new DropZoneRegistry();

/** Registers (or replaces) a mounted zone; returns its unregister function. */
export function registerDropZone(zone: MountedDropZone): () => void {
  return sharedDropZones.register(zone);
}

/** The mounted zones accepting the drag type, in mount order. */
export function zonesAccepting(dragType: string | null | undefined): MountedDropZone[] {
  return sharedDropZones.zonesAccepting(dragType);
}

/** Subscribes to registry changes; returns the unsubscribe function. */
export function subscribeDropZones(listener: () => void): () => void {
  return sharedDropZones.subscribe(listener);
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
