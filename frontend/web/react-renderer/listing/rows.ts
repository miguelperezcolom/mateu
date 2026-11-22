import type { ColDef } from '@rn/renderer/crudListing'

export type Dict = Record<string, unknown>
export type Row = Dict

export const NUMERIC = new Set(['integer', 'int', 'number', 'money', 'double', 'decimal', 'long', 'float'])
export const ROW_ACTION_TYPES = new Set(['actionGroup', 'menu', 'action'])

/** A row's key for React and the DataTable: its id (kept unique by the index), else its place. */
export function rowKeyOf(row: Row, index: number): string {
  const id = row['id'] ?? row['_id'] ?? row['key']
  return id !== undefined && id !== null && id !== '' ? `${String(id)}#${index}` : `row-${index}`
}

/** The row as the server sent it (without the renderer's own key). */
export function withoutRowKey(row: Row): Row {
  const { __mateuRowKey: _k, ...rest } = row
  return rest
}

export function optionsOf(filter: Dict): { value: string; label: string }[] {
  return ((filter['options'] as Dict[] | undefined) ?? [])
    .map((o) => ({ value: String(o['value'] ?? o['key'] ?? ''), label: String(o['label'] ?? o['value'] ?? '') }))
    .filter((o) => o.value !== '')
}

/** A multi-value filter's values: a list, or the comma-joined string a URL carries. */
export function multiValues(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === 'string' && v) return v.split(',').map((s) => s.trim()).filter(Boolean)
  if (v === undefined || v === null || v === '') return []
  return [String(v)]
}

/** The sort the listing already has (a link, a Back): shown on its column header. */
export function initialSortOf(sort: unknown, defs: ColDef[]): Dict {
  const first = (Array.isArray(sort) ? sort[0] : undefined) as Dict | undefined
  const field = String(first?.['fieldId'] ?? first?.['field'] ?? '')
  if (!field || !defs.some((d) => d.fieldId === field && d.sortable)) return {}
  return { initialSortColumn: field, initialSortDirection: first?.['direction'] === 'descending' ? 'DESC' : 'ASC' }
}

export const isBool = (dataType: string, value?: unknown): boolean =>
  dataType === 'bool' || dataType === 'boolean' || typeof value === 'boolean'

/** A row's children in a tree listing (the self-referential `children` list); none = a leaf. */
export const childrenOf = (row: Row): Row[] =>
  (Array.isArray(row['children']) ? (row['children'] as Row[]) : []).filter((c) => c && typeof c === 'object')
