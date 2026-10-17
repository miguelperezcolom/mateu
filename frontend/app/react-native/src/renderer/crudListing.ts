// The CRUD listing's view-model: everything CrudRenderer.tsx decides that is not drawing — reading
// the search response, the paging counters, the sort cycle, which filters count as applied, how
// they are written into the component state, the mobile row shortcut and the column definitions.
// Pure TypeScript, so node's runner tests it; the .tsx keeps only hooks and views.
import { cellActionOf, isDisplayColumn, type RowOpen } from '../core/rowOpen.ts';

type Dict = Record<string, unknown>;

/** Keeps the LISTING ENVELOPE ({page, aggregates?, groups?} — the value keyed by the crud id in
 *  the search response) so totals/groups survive; falls back to the raw fragment data. */
export function normalizeCrudData(data: unknown): unknown {
  const d = data as Dict | null;
  if (!d || typeof d !== 'object') return data;
  if ('page' in d) return d; // already the envelope
  for (const value of Object.values(d)) {
    if (value && typeof value === 'object' && 'page' in (value as Dict)) return value;
  }
  return data;
}

/** The listing envelope (aggregates/groups source) when the live data carries one. */
export function extractListing<T = Dict>(data: unknown): T {
  const d = data as Dict | null;
  if (d && typeof d === 'object' && 'page' in d) return d as T;
  return {} as T;
}

/** The page object (rows + paging counters), whether the data is the envelope or the bare page. */
export function extractPage(data: unknown): Dict | undefined {
  const d = data as Dict | null;
  if (!d || typeof d !== 'object') return undefined;
  if ('page' in d && d['page'] && typeof d['page'] === 'object') return d['page'] as Dict;
  return d;
}

export function extractRows(data: unknown): Dict[] {
  if (!data) return [];
  const d = data as Dict;
  const content = d['content'] ?? data;
  if (Array.isArray(content)) return content as Dict[];
  return [];
}

export interface Paging {
  rows: Dict[];
  totalElements: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** Rows and paging counters of the live listing data; a page without counters is one full page. */
export function pagingOf(liveData: unknown): Paging {
  const page = extractPage(liveData);
  const rows = extractRows(page);
  const totalElements = Number(page?.['totalElements'] ?? rows.length);
  const pageSize = Number(page?.['pageSize'] ?? rows.length) || rows.length;
  const pageNumber = Number(page?.['pageNumber'] ?? 0);
  const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 1;
  return {
    rows,
    totalElements,
    pageSize,
    pageNumber,
    totalPages,
    hasPrevious: pageNumber > 0,
    hasNext: (pageNumber + 1) * pageSize < totalElements,
  };
}

export type SortState = { field: string; direction: 'ascending' | 'descending' } | null;

/** A header tap cycles ascending → descending → none; another column starts ascending. */
export function nextSort(current: SortState, field: string): SortState {
  if (current?.field !== field) return { field, direction: 'ascending' };
  return current.direction === 'ascending' ? { field, direction: 'descending' } : null;
}

export function sortMark(current: SortState, field: string): string {
  return current?.field === field ? (current.direction === 'ascending' ? ' ▲' : ' ▼') : '';
}

/** A filter value that means "not filtering": absent, blank, or an empty multi-select. */
export function isBlankFilterValue(v: unknown): boolean {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
}

export function activeFilterCount(values: Dict): number {
  return Object.values(values).filter((v) => !isBlankFilterValue(v)).length;
}

/** Writes a search into the component state: the text, back to page 0, and every filter — a blank
 *  one is REMOVED rather than sent empty (the server would read "" as a condition). */
export function applySearchToState(state: Dict, searchText: string, filterValues: Dict): void {
  state['searchText'] = searchText;
  state['page'] = 0;
  for (const [k, v] of Object.entries(filterValues)) {
    if (isBlankFilterValue(v)) delete state[k];
    else state[k] = v;
  }
}

/** Selection: a row toggled in or out (by identity), and the select-all toggle. */
export function toggledSelection(selected: Dict[], row: Dict): Dict[] {
  return selected.includes(row) ? selected.filter((r) => r !== row) : [...selected, row];
}

export function allRowsSelected(rows: Dict[], selected: Dict[]): boolean {
  return rows.length > 0 && rows.every((r) => selected.includes(r));
}

const ACTION_COLUMN_TYPES = new Set(['actionGroup', 'menu', 'action']);

/** The mobile shortcut of a listing that is not navigable: the row's first group action (its
 *  primary — e.g. "Check-in"), as the crud action id; '' when the row has none. */
export function firstRowAction(columns: { metadata?: Dict }[], row: Dict): string {
  for (const col of columns) {
    const cm = (col.metadata ?? {}) as Dict;
    if (ACTION_COLUMN_TYPES.has(String(cm['dataType'] ?? ''))) {
      const cell = row[String(cm['id'] ?? '')] as Dict | undefined;
      const actions = (cell?.['actions'] as Dict[]) ?? [];
      const method = actions[0]?.['methodNameInCrud'];
      if (method) return `action-on-row-${method}`;
    }
  }
  return '';
}

export interface ColDef {
  fieldId: string;
  label: string;
  dataType: string;
  stereotype: string;
  aggregate: string;
  sortable: boolean;
  sortingProperty: string;
  tooltipPath: string;
  valueLabels: Record<string, string> | null;
  display: boolean;
  cellAction: string;
  editable: boolean;
}

/** The columns the listing renders as cells (the row-action columns become the row's menu). */
export function columnDefsOf(
  columns: { id?: string; fieldId?: string; label?: string; metadata?: Dict }[],
  rowOpen: RowOpen | undefined,
): ColDef[] {
  return columns
    .map((col) => {
      const cm = (col.metadata ?? {}) as Dict;
      return {
        fieldId: (cm['id'] as string) ?? col.id ?? col.fieldId ?? '',
        label: (cm['label'] as string) ?? col.label ?? col.id ?? '',
        dataType: (cm['dataType'] as string) ?? '',
        stereotype: (cm['stereotype'] as string) ?? '',
        aggregate: (cm['aggregate'] as string) ?? '',
        sortable: cm['sortable'] === true,
        sortingProperty: (cm['sortingProperty'] as string) ?? '',
        // @Tooltip("otherField") / a fixed width: the field the cell shows on hover — on touch,
        // on LONG-PRESS (a short press keeps opening the row).
        tooltipPath: (cm['tooltipPath'] as string) ?? '',
        // an enum column's labels (IN_HOUSE → "In house"); the row keeps the raw value
        valueLabels: (cm['valueLabels'] as Record<string, string> | null | undefined) ?? null,
        // whole-row press: a display column (own action, link, editor…) keeps its own press
        display: !!rowOpen && isDisplayColumn(cm),
        cellAction: cellActionOf(cm),
        editable: cm['editable'] === true,
      };
    })
    .filter((c) => !ACTION_COLUMN_TYPES.has(c.dataType));
}
