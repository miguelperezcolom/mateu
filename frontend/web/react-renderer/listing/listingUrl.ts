import { sortDirectionOf } from '@infra/ui/sortDirection.ts'

type Dict = Record<string, unknown>

/**
 * A top-level listing keeps its search, filters, page and sort in the address bar, with the web
 * renderer's names (mateu-table-crud): `searchText` (a link may say `q`), each filter's id (a range
 * as `<id>_from` / `<id>_to`), `page`, `sort=field:direction,…` — so a shared link or Back shows the
 * same rows, and the other renderers read the same URL.
 */
export const LISTING_PARAMS = (filterIds: string[]) => ['searchText', 'q', 'page', 'sort', ...filterIds]

/** The filter keys a listing owns in the URL (a range filter owns its two bounds). */
export function filterKeysOf(filters: Dict[]): string[] {
  return filters.flatMap((f) => {
    const id = String(f['fieldId'] ?? '')
    const st = String(f['stereotype'] ?? '')
    return st === 'dateRange' || st === 'numberRange' ? [`${id}_from`, `${id}_to`] : [id]
  }).filter(Boolean)
}

/** What the URL asks of the listing: null when it asks nothing. */
export function listingStateFromUrl(search: string, filterKeys: string[]): { searchText?: string; page?: number; sort?: Dict[]; filters: Dict } | null {
  const params = new URLSearchParams(search)
  const out: { searchText?: string; page?: number; sort?: Dict[]; filters: Dict } = { filters: {} }
  let any = false
  const text = params.get('searchText') ?? params.get('q')
  if (text !== null) { out.searchText = text; any = true }
  const page = Number.parseInt(params.get('page') ?? '', 10)
  if (Number.isFinite(page) && page > 0) { out.page = page; any = true }
  const sort = (params.get('sort') ?? '').split(',').map((s) => {
    const [fieldId, raw] = s.split(':')
    const direction = sortDirectionOf(raw)
    return fieldId && direction ? { field: fieldId, fieldId, direction } : null
  }).filter((s): s is { field: string; fieldId: string; direction: 'ascending' | 'descending' } => !!s)
  if (sort.length) { out.sort = sort; any = true }
  for (const k of filterKeys) {
    const v = params.get(k)
    if (v !== null && v !== '') { out.filters[k] = v; any = true }
  }
  return any ? out : null
}

/** Writes the listing's state into the URL (a history entry: Back returns to the previous rows; `replace` normalises the URL it opened with). */
export function writeListingUrl(state: Dict, filterKeys: string[], replace = false): void {
  const params = new URLSearchParams(window.location.search)
  for (const k of LISTING_PARAMS(filterKeys)) params.delete(k)
  const text = String(state['searchText'] ?? '')
  if (text) params.set('searchText', text)
  for (const k of filterKeys) {
    const v = state[k]
    if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) params.set(k, Array.isArray(v) ? v.join(',') : String(v))
  }
  const page = Number(state['page'] ?? 0)
  if (page > 0) params.set('page', String(page))
  const sort = ((state['sort'] as Dict[] | undefined) ?? [])
    .map((s) => `${String(s['fieldId'] ?? s['field'] ?? '')}:${String(s['direction'] ?? '')}`)
    .filter((s) => !s.startsWith(':') && !s.endsWith(':'))
  if (sort.length) params.set('sort', sort.join(','))
  const query = params.toString()
  const url = window.location.pathname + (query ? `?${query}` : '')
  if (url === window.location.pathname + window.location.search) return
  if (replace) window.history.replaceState(window.history.state, '', url)
  else window.history.pushState(window.history.state, '', url)
}
