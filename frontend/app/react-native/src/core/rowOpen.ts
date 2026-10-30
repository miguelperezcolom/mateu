/**
 * Whole-row press on a listing (decision U1, the same rule as the web's libs/mateu rowOpen.ts and
 * Redwood's isDisplayColumn): a NAVIGABLE row — one whose listing declares a `rowRoute`, or whose
 * first column carries `actionId: "view"` — opens its record wherever it is pressed. The cells
 * with a press of their own (the selection box, inline editors, buttons, links, menus, components,
 * any column with its own actionId) keep it: they are drawn as their own touchables, so a press
 * there never reaches the row.
 */

type Dict = Record<string, unknown>;

export const ROW_OPEN_ACTION_ID = 'view';

const DISPLAY_DATA_TYPES = ['action', 'actionGroup', 'menu', 'component', 'link', 'button'];
const DISPLAY_STEREOTYPES = ['button', 'link', 'html'];

/** How a row opens: by route, or by running the `view` action with the row. */
export type RowOpen = { kind: 'route'; template: string } | { kind: 'action'; actionId: string };

/** The listing is navigable when it declares a rowRoute (wins) or a column carries `view`. */
export function rowOpenOf(rowRoute: unknown, columnMetas: Dict[]): RowOpen | undefined {
  if (typeof rowRoute === 'string' && rowRoute) return { kind: 'route', template: rowRoute };
  if (columnMetas.some((c) => c?.['actionId'] === ROW_OPEN_ACTION_ID)) {
    return { kind: 'action', actionId: ROW_OPEN_ACTION_ID };
  }
  return undefined;
}

/** A column whose cells have a press of their own, so pressing one never opens the row. */
export function isDisplayColumn(c: Dict | undefined | null): boolean {
  if (!c) return true;
  if (c['editable'] === true) return true;
  const dataType = typeof c['dataType'] === 'string' ? (c['dataType'] as string) : '';
  const stereotype = typeof c['stereotype'] === 'string' ? (c['stereotype'] as string) : '';
  if (dataType && DISPLAY_DATA_TYPES.includes(dataType)) return true;
  if (stereotype && DISPLAY_STEREOTYPES.includes(stereotype)) return true;
  const actionId = c['actionId'];
  return typeof actionId === 'string' && !!actionId && actionId !== ROW_OPEN_ACTION_ID;
}

/** The action a display cell runs when pressed (its own actionId, with the row), or '' when it has
 *  none — then the cell is just inert, it still must not open the row. */
export function cellActionOf(c: Dict | undefined | null): string {
  const actionId = c?.['actionId'];
  return typeof actionId === 'string' && actionId !== ROW_OPEN_ACTION_ID ? actionId : '';
}

/** `people/${row.id}` against the row; undefined when any placeholder stays unresolved (better to
 *  do nothing than to land on a route nobody declared). */
export function rowRouteOf(template: string, row: Dict): string | undefined {
  let unresolved = false;
  const route = template.replace(/\$\{\s*row\.([\w.]+)\s*\}/g, (_m, path: string) => {
    let v: unknown = row;
    for (const k of path.split('.')) v = v && typeof v === 'object' ? (v as Dict)[k] : undefined;
    if (v === undefined || v === null || v === '') { unresolved = true; return ''; }
    return String(v);
  });
  if (unresolved || route.includes('${')) return undefined;
  return route.replace(/^\/+/, '');
}

/** The row fields a `rowRoute` needs beyond the visible columns (`people/${row.id}` → `id`): a row
 *  fetched from a source carries only the columns, and nobody declares an id column — without them
 *  the route never resolved and a tap on the row did nothing (the web's rowRouteFields). */
export function rowRouteFields(template: unknown): string[] {
  if (typeof template !== 'string' || !template) return [];
  return [...new Set([...template.matchAll(/\$\{\s*row\.([A-Za-z0-9_]+)/g)].map((m) => m[1]))];
}

/** What pressing this row does, or undefined (group marker, `viewable: false`, unresolved route). */
export type RowPress =
  | { kind: 'route'; route: string }
  | { kind: 'action'; actionId: string; parameters: Dict };

export function rowPressOf(open: RowOpen | undefined, row: Dict | null | undefined): RowPress | undefined {
  if (!open || !row || row['__mateuGroup'] || row['viewable'] === false) return undefined;
  if (open.kind === 'route') {
    const route = rowRouteOf(open.template, row);
    return route ? { kind: 'route', route } : undefined;
  }
  return { kind: 'action', actionId: open.actionId, parameters: { ...row } };
}

/** The accessible name of a pressable row: what it opens. */
export function rowOpenLabel(primaryText: string): string {
  return primaryText ? `Open ${primaryText}` : 'Open';
}
