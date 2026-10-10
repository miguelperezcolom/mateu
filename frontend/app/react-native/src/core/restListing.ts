// In-memory search / filter / sort / page of rows fetched from a REST source — the RN twin of
// libs/mateu restRowFilters.ts (filterExternalRows + sortExternalRows) and of mateu-table-crud's
// unpaged path. RN fetches a REST listing whole (it does not honour totalPath), and a source answered
// from its SAMPLE cannot honour `${state.page}` either, so the conditions are applied here.
// Pure — no imports — so node --test can run it.

type Row = Record<string, unknown>;

export interface RestFilterMeta {
  fieldId?: string;
  dataType?: string;
  stereotype?: string;
  options?: unknown[];
}

const blank = (v: unknown): boolean =>
  v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));

const multiValues = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw !== '') return raw.split(',').map((v) => v.trim()).filter((v) => v);
  return [];
};

const withinRange = (cell: unknown, from: unknown, to: unknown, numeric: boolean): boolean => {
  if (numeric) {
    const value = Number(cell);
    if (cell === '' || cell == null || Number.isNaN(value)) return false;
    if (!blank(from) && value < Number(from)) return false;
    if (!blank(to) && value > Number(to)) return false;
    return true;
  }
  const text = cell == null ? '' : String(cell);
  if (text === '') return false;
  if (!blank(from) && text < String(from)) return false;
  if (!blank(to) && text > String(to)) return false;
  return true;
};

const matchesFilter = (row: Row, field: RestFilterMeta, state: Row): boolean => {
  const id = field.fieldId;
  if (!id) return true;
  const cell = row[id];
  if (field.stereotype === 'dateRange' || field.stereotype === 'numberRange') {
    const from = state[`${id}_from`];
    const to = state[`${id}_to`];
    if (blank(from) && blank(to)) return true;
    return withinRange(cell, from, to, field.stereotype === 'numberRange');
  }
  if (field.stereotype === 'multiSelect') {
    const wanted = multiValues(state[id]);
    return wanted.length === 0 || wanted.includes(String(cell ?? ''));
  }
  const value = state[id];
  if (blank(value)) return true;
  if (field.dataType === 'boolean' || field.dataType === 'bool' || field.stereotype === 'checkbox' || field.stereotype === 'toggle') {
    const wanted = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true';
    const actual = typeof cell === 'boolean' ? cell : String(cell ?? '').toLowerCase() === 'true';
    return wanted === actual;
  }
  // An option list is a pick, not a prefix: "male" must not also match "female".
  if ((field.options?.length ?? 0) > 0) return String(cell ?? '') === String(value);
  return String(cell ?? '').toLowerCase().includes(String(value).toLowerCase());
};

/** Free-text search over the visible columns + every declared filter (state keys = the filter
 *  bar's: `<id>`, `<id>_from`/`<id>_to`, a multi-select as array or comma-joined string). */
export function filterRestRows(rows: Row[], columnIds: string[], filters: RestFilterMeta[] | undefined, state: Row): Row[] {
  const searchText = String(state?.['searchText'] ?? '').trim().toLowerCase();
  const declared = (filters ?? []).filter((f) => f?.fieldId);
  if (searchText === '' && declared.length === 0) return rows;
  return rows.filter((row) => {
    if (searchText !== '' && !columnIds.some((id) => String(row[id] ?? '').toLowerCase().includes(searchText))) return false;
    return declared.every((f) => matchesFilter(row, f, state ?? {}));
  });
}

/** The listing's sort state (`[{field|fieldId, direction}]`) applied in order: numbers numerically,
 *  the rest as case-insensitive text, blanks last either way. New array; no sort = rows untouched. */
export function sortRestRows(rows: Row[], sort: { fieldId?: string; field?: string; direction?: string }[] | undefined): Row[] {
  const keys = (Array.isArray(sort) ? sort : [])
    .map((s) => ({ id: s?.fieldId ?? s?.field ?? '', desc: s?.direction === 'descending' || s?.direction === 'desc' }))
    .filter((k) => k.id !== '');
  if (keys.length === 0) return rows;
  const compare = (a: unknown, b: unknown): number => {
    const aBlank = blank(a), bBlank = blank(b);
    if (aBlank || bBlank) return aBlank === bBlank ? 0 : aBlank ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
  };
  return [...rows].sort((x, y) => {
    for (const k of keys) {
      const c = compare(x[k.id], y[k.id]);
      if (c !== 0) return k.desc ? -c : c;
    }
    return 0;
  });
}

/** Search + filter + sort + slice one page: the listing's `page` envelope. `pageSize <= 0` = one
 *  page with everything. */
export function restListingPage(
  rows: Row[],
  opts: { columnIds: string[]; filters?: RestFilterMeta[]; state: Row; pageSize?: number },
): { content: Row[]; totalElements: number; pageSize: number; pageNumber: number } {
  const state = opts.state ?? {};
  const all = sortRestRows(filterRestRows(rows, opts.columnIds, opts.filters, state), state['sort'] as never);
  const size = opts.pageSize && opts.pageSize > 0 ? opts.pageSize : all.length || 1;
  const lastPage = Math.max(0, Math.ceil(all.length / size) - 1);
  const page = Math.min(Math.max(0, Number(state['page'] ?? 0) || 0), lastPage);
  return { content: all.slice(page * size, page * size + size), totalElements: all.length, pageSize: size, pageNumber: page };
}
