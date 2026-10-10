/**
 * Hover details on a touch screen. The wire has two of them:
 *
 *  - a `Popover` whose `trigger` is `"hover"` (read-only details: a rate breakdown, a reservation
 *    summary). A touch screen has no hover, so it opens on PRESS exactly like a `"click"` popover —
 *    `popoverOpensOnPress` is therefore always true; it exists so that decision is written down once.
 *  - a listing column carrying `tooltipPath` (`@Tooltip("otherField")` on the row field, or a
 *    fixed-width column pointing at itself): the cell shows ANOTHER field of the row on hover. Here
 *    it shows on LONG-PRESS of the cell (a short press keeps opening the row).
 *
 * Pure logic (no react-native import) so it runs under `node --test`.
 */

/** Whether a popover with this trigger opens on press. Always: there is no hover on touch. */
export function popoverOpensOnPress(trigger: unknown): boolean {
  void trigger; // "click" and "hover" alike — a finger can only press
  return true;
}

/** Reads a dot path (`a.b.c`) off a row; undefined when any step is missing. */
function readPath(row: Record<string, unknown>, path: string): unknown {
  let current: unknown = row;
  for (const step of path.split('.')) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[step];
  }
  return current;
}

/**
 * The text a cell shows on long-press: the row's `tooltipPath` field, line breaks kept. Null when
 * the column declares no tooltipPath or the field is empty — then the cell gets no long-press at all.
 */
export function cellTooltipText(row: Record<string, unknown>, tooltipPath: unknown): string | null {
  if (typeof tooltipPath !== 'string' || !tooltipPath.trim()) return null;
  const value = readPath(row, tooltipPath.trim());
  if (value === null || value === undefined) return null;
  const text = typeof value === 'object'
    ? String((value as Record<string, unknown>)['message'] ?? (value as Record<string, unknown>)['value'] ?? JSON.stringify(value))
    : String(value);
  return text.trim() ? text : null;
}
