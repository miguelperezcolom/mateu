// Small readers of the loosely-typed wire JSON the view controller walks, and the route texts it
// derives. Pure TypeScript, tested by node's runner.

type Json = Record<string, any>;

/** The value when it is an array, else []. */
export function asArray(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

/** null/undefined → '', anything else its string form. */
export function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

/** Navigate a dot path (`profile`, `data.address`) into a JSON value; an empty path is identity. */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce<unknown>(
    (acc, key) => (acc != null && typeof acc === 'object' ? (acc as Json)[key] : undefined),
    obj,
  );
}

/** A route without its leading and trailing slashes. */
export function trimSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, '');
}

/** A detail screen's title from the mediator's route suffix: its last segment, "New", or "Detail". */
export function detailLabel(routeSuffix: string): string {
  const seg = trimSlashes(routeSuffix).split('/').pop() ?? '';
  if (!seg) return 'Detail';
  return seg.toLowerCase() === 'new' ? 'New' : seg;
}

/** An error's message (an Error's own, else its string form). */
export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
