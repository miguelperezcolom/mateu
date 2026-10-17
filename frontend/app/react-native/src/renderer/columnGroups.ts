// Column groups (GridGroupColumn — a header spanning several columns) on the native tables. The
// native grids lay their columns out flat, so a group is FLATTENED into its leaf columns and the
// group's label prefixes each of theirs ("Occupancy · Adults"): no grouped column is lost and the
// grouping still reads in the header. Same rule as the Redwood renderer (poc/core/listing.mjs
// leafColumnsOf) and the IntelliJ plugin (ui/ColumnGroups.kt).

type Dict = Record<string, unknown>;

export const COLUMN_GROUP_SEPARATOR = ' · ';

const metaOf = (node: unknown): Dict =>
  ((node as Dict)?.['metadata'] as Dict | undefined) ?? ((node as Dict) ?? {});

/** The leaf columns of a wire column list, in wire order, each in the SAME shape it arrived in (a
 *  ClientSide node keeps its envelope, bare metadata stays bare); a grouped column's label carries
 *  its group's label(s) as prefix. Non-group columns are returned untouched. */
export function flattenColumnGroups<T>(columns: T[] | null | undefined): T[] {
  const out: T[] = [];
  const walk = (col: unknown, prefix: string) => {
    if (!col || typeof col !== 'object') return;
    const m = metaOf(col);
    if (m['type'] === 'GridGroupColumn') {
      const label = typeof m['label'] === 'string' ? (m['label'] as string) : '';
      const next = label ? (prefix ? prefix + COLUMN_GROUP_SEPARATOR + label : label) : prefix;
      for (const k of ((m['columns'] as unknown[]) ?? [])) walk(k, next);
      for (const k of (((col as Dict)['children'] as unknown[]) ?? [])) walk(k, next);
      return;
    }
    if (!prefix) {
      out.push(col as T);
      return;
    }
    const own = (m['label'] as string | undefined) ?? (m['id'] as string | undefined) ?? '';
    const metadata = { ...m, label: prefix + COLUMN_GROUP_SEPARATOR + own };
    out.push(((col as Dict)['metadata'] ? { ...(col as Dict), metadata } : metadata) as T);
  };
  for (const c of columns ?? []) walk(c, '');
  return out;
}
